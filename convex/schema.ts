import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    clientUuid: v.string(),
    type: v.union(
      v.literal("INCOME"),
      v.literal("EXPENSE"),
      v.literal("TAX_PAYMENT"),
      v.literal("SUBSCRIPTION"),
    ),
    amount: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CLEARED"),
      v.literal("ACTIVE"),
      v.literal("CANCELLED"),
    ),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
    taxAmount: v.optional(v.number()),
    taxCleared: v.optional(v.boolean()),
    timestamp: v.optional(v.number()),
    taxRate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clientUuid", ["clientUuid"])
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"]),

  subscriptions: defineTable({
    name: v.string(),
    monthlyCost: v.number(),
    isActive: v.boolean(),
  }),
});
