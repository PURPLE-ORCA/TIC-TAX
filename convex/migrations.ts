import { mutation } from './_generated/server';
import { v } from 'convex/values';

type NextType = 'INCOME' | 'EXPENSE' | 'TAX_PAYMENT' | 'SUBSCRIPTION';
type NextStatus = 'PENDING' | 'CLEARED' | 'ACTIVE' | 'CANCELLED';

function mapLegacyType(value: unknown): NextType {
  if (value === 'IN') return 'INCOME';
  if (value === 'OUT') return 'EXPENSE';
  if (value === 'INCOME' || value === 'EXPENSE' || value === 'TAX_PAYMENT' || value === 'SUBSCRIPTION') {
    return value;
  }
  return 'EXPENSE';
}

function mapLegacyStatus(value: unknown): NextStatus {
  if (value === 'PENDING' || value === 'CLEARED' || value === 'ACTIVE' || value === 'CANCELLED') {
    return value;
  }
  return 'CLEARED';
}

function normalizeAmountToCents(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Number.isInteger(value) ? value : Math.round(value * 100);
}

export const migrateTransactionsToV120 = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 500, 1), 2000);
    const rows = await ctx.db.query('transactions').take(limit);

    let scanned = 0;
    let migrated = 0;

    for (const row of rows) {
      scanned += 1;
      const legacy = row as unknown as Record<string, unknown>;

      const hasClientUuid = typeof legacy.clientUuid === 'string';
      const hasNewType =
        legacy.type === 'INCOME' ||
        legacy.type === 'EXPENSE' ||
        legacy.type === 'TAX_PAYMENT' ||
        legacy.type === 'SUBSCRIPTION';
      const hasNewAmount = typeof legacy.amount === 'number' && Number.isInteger(legacy.amount);

      if (hasClientUuid && hasNewType && hasNewAmount) {
        continue;
      }

      const type = mapLegacyType(legacy.type);
      const amount = normalizeAmountToCents(legacy.amount);
      const status = mapLegacyStatus(legacy.status);
      const createdAt =
        typeof legacy.createdAt === 'number'
          ? legacy.createdAt
          : typeof legacy.timestamp === 'number'
            ? legacy.timestamp
            : row._creationTime;
      const updatedAt = typeof legacy.updatedAt === 'number' ? legacy.updatedAt : createdAt;

      await ctx.db.patch(row._id, {
        clientUuid: typeof legacy.clientUuid === 'string' ? legacy.clientUuid : String(row._id),
        type,
        amount,
        status,
        taxRate: typeof legacy.taxRate === 'number' ? legacy.taxRate : 100,
        createdAt,
        updatedAt,
      });

      migrated += 1;
    }

    return {
      scanned,
      migrated,
      remainingHint: scanned === limit,
    };
  },
});
