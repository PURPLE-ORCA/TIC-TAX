import { mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import { ConvexError, v } from 'convex/values';

const transactionTypeValidator = v.union(
  v.literal('INCOME'),
  v.literal('EXPENSE'),
  v.literal('TAX_PAYMENT'),
  v.literal('SUBSCRIPTION'),
);

const transactionStatusValidator = v.union(
  v.literal('PENDING'),
  v.literal('CLEARED'),
  v.literal('ACTIVE'),
  v.literal('CANCELLED'),
);

async function insertIfMissingByClientUuid(
  ctx: MutationCtx,
  input: {
    clientUuid: string;
    type: 'INCOME' | 'EXPENSE' | 'TAX_PAYMENT' | 'SUBSCRIPTION';
    amount: number;
    status: 'PENDING' | 'CLEARED' | 'ACTIVE' | 'CANCELLED';
    taxRate: number;
    createdAt: number;
    updatedAt: number;
  },
) {
  const existing = await ctx.db
    .query('transactions')
    .withIndex('by_clientUuid', (q) => q.eq('clientUuid', input.clientUuid))
    .unique();

  if (existing) {
    return { ok: true as const, duplicate: true as const, id: existing._id };
  }

  const id = await ctx.db.insert('transactions', {
    clientUuid: input.clientUuid,
    type: input.type,
    amount: input.amount,
    status: input.status,
    taxRate: input.taxRate,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });

  return { ok: true as const, duplicate: false as const, id };
}

export const addTransaction = mutation({
  args: {
    clientUuid: v.string(),
    type: transactionTypeValidator,
    amount: v.number(),
    status: transactionStatusValidator,
    taxRate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await insertIfMissingByClientUuid(ctx, {
      clientUuid: args.clientUuid,
      type: args.type,
      amount: args.amount,
      status: args.status,
      taxRate: args.taxRate ?? 100,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const logTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal('IN'), v.literal('OUT')),
    status: v.optional(v.union(v.literal('PENDING'), v.literal('CLEARED'))),
    category: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const clientUuid = `legacy-${now}-${Math.floor(Math.random() * 1_000_000)}`;
    const mappedType = args.type === 'IN' ? 'INCOME' : 'EXPENSE';
    const mappedStatus = args.status ?? 'CLEARED';

    return await insertIfMissingByClientUuid(ctx, {
      clientUuid,
      type: mappedType,
      amount: Math.round(args.amount * 100),
      status: mappedStatus,
      taxRate: 100,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTransactionStatus = mutation({
  args: {
    clientUuid: v.string(),
    status: transactionStatusValidator,
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('transactions')
      .withIndex('by_clientUuid', (q) => q.eq('clientUuid', args.clientUuid))
      .unique();

    if (!existing) {
      throw new ConvexError('Transaction not found.');
    }

    if (existing.status === args.status) {
      return { ok: true, unchanged: true };
    }

    await ctx.db.patch(existing._id, {
      status: args.status,
      updatedAt: args.updatedAt,
    });

    return { ok: true, unchanged: false };
  },
});

export const deleteTransaction = mutation({
  args: {
    id: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'CANCELLED',
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const clearInvoice = mutation({
  args: {
    id: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new ConvexError('Transaction not found.');
    }

    if (transaction.type !== 'INCOME') {
      throw new ConvexError('Only income transactions can be cleared.');
    }

    await ctx.db.patch(args.id, {
      status: 'CLEARED',
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const markTaxesPaid = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    await insertIfMissingByClientUuid(ctx, {
      clientUuid: `tax-payment-${now}`,
      type: 'TAX_PAYMENT',
      amount: 0,
      status: 'CLEARED',
      taxRate: 100,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const allTxs = await ctx.db.query('transactions').collect();

    let totalIn = 0;
    let totalOut = 0;
    let totalTax = 0;
    let taxHostage = 0;
    let pendingCapital = 0;

    for (const tx of allTxs) {
      if (tx.status === 'CANCELLED') {
        continue;
      }

      if (tx.type === 'INCOME') {
        if (tx.status === 'PENDING') {
          pendingCapital += tx.amount;
          continue;
        }

        totalIn += tx.amount;
        const taxAmount = Math.trunc((tx.amount * tx.taxRate) / 10000);
        totalTax += taxAmount;
        taxHostage += taxAmount;
      }

      if (tx.type === 'EXPENSE' || tx.type === 'SUBSCRIPTION') {
        totalOut += tx.amount;
      }

      if (tx.type === 'TAX_PAYMENT') {
        taxHostage -= tx.amount;
      }
    }

    const recentRows = await ctx.db
      .query('transactions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(10);

    const recentTransactions: Array<{
      _id: (typeof recentRows)[number]['_id'];
      amount: number;
      category: string;
      note?: string;
      type: 'IN' | 'OUT';
      status?: 'PENDING' | 'CLEARED';
    }> = recentRows.map((row) => ({
      _id: row._id,
      amount: row.amount / 100,
      category: row.type === 'SUBSCRIPTION' ? 'Subscription' : 'Ledger',
      note: undefined,
      type: row.type === 'INCOME' ? 'IN' : 'OUT',
      status: row.status === 'PENDING' ? 'PENDING' : 'CLEARED',
    }));

    const safeToSpend = totalIn - totalOut - totalTax;

    return {
      safeToSpend,
      taxHostage: Math.max(0, taxHostage),
      pendingCapital,
      totalBleed: totalOut,
      recentTransactions,
    };
  },
});
