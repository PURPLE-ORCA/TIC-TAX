import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const addSubscription = mutation({
  args: {
    name: v.string(),
    monthlyCost: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("subscriptions", {
      name: args.name,
      monthlyCost: args.monthlyCost,
      isActive: true,
    });
  },
});

export const deleteSubscription = mutation({
  args: {
    id: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
