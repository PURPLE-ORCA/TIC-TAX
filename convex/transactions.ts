import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal("IN"), v.literal("OUT")),
    category: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // The 1% Tax Logic: Only applies to Income.
    const taxAmount = args.type === "IN" ? args.amount * 0.01 : 0;

    await ctx.db.insert("transactions", {
      amount: args.amount,
      type: args.type,
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
    let taxHostage = 0;

    for (const tx of allTxs) {
      if (tx.type === "IN") {
        totalIn += tx.amount;
        taxHostage += tx.taxAmount;
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
    const safeToSpend = totalIn - totalOut - taxHostage;

    return {
      safeToSpend,
      taxHostage,
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
