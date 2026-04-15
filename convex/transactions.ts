import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const logTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal("IN"), v.literal("OUT")),
    status: v.optional(v.union(v.literal("PENDING"), v.literal("CLEARED"))),
    category: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "CLEARED";
    const taxAmount =
      args.type === "IN" && status === "CLEARED" ? args.amount * 0.01 : 0;

    await ctx.db.insert("transactions", {
      amount: args.amount,
      type: args.type,
      status,
      category: args.category,
      taxAmount: taxAmount,
      timestamp: Date.now(),
      note: args.note,
    });
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const allTxs = await ctx.db.query("transactions").collect();

    let totalIn = 0;
    let totalOut = 0;
    let totalTax = 0;
    let taxHostage = 0;
    let pendingCapital = 0;

    for (const tx of allTxs) {
      if (tx.type === "IN") {
        const status = tx.status ?? "CLEARED";
        if (status === "PENDING") {
          pendingCapital += tx.amount;
          continue;
        }

        totalIn += tx.amount;
        totalTax += tx.taxAmount;
        if (!tx.taxCleared) {
          taxHostage += tx.taxAmount;
        }
      } else {
        totalOut += tx.amount;
      }
    }

    const recentTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(10);

    // Safe to spend is Total Income - Total Expenses - The 1% we owe the government
    const safeToSpend = totalIn - totalOut - totalTax;

    return {
      safeToSpend,
      taxHostage,
      pendingCapital,
      totalBleed: totalOut,
      recentTransactions,
    };
  },
});

export const deleteTransaction = mutation({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const markTaxesPaid = mutation({
  args: {},
  handler: async (ctx) => {
    const incomeTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_type", (q) => q.eq("type", "IN"))
      .collect();

    for (const tx of incomeTransactions) {
      if (!tx.taxCleared) {
        await ctx.db.patch(tx._id, { taxCleared: true });
      }
    }
  },
});

export const clearInvoice = mutation({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new ConvexError("Transaction not found.");
    }

    if (transaction.type !== "IN") {
      throw new ConvexError("Only income transactions can be cleared.");
    }

    await ctx.db.patch(args.id, {
      status: "CLEARED",
      taxAmount: transaction.amount * 0.01,
      taxCleared: false,
    });
  },
});
