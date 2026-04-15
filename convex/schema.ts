import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    amount: v.number(),
    type: v.union(v.literal("IN"), v.literal("OUT")),
    status: v.optional(v.union(v.literal("PENDING"), v.literal("CLEARED"))),
    category: v.string(),
    taxAmount: v.number(),
    taxCleared: v.optional(v.boolean()),
    timestamp: v.number(),
    note: v.optional(v.string()),
  }).index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  subscriptions: defineTable({
    name: v.string(),
    monthlyCost: v.number(),
    isActive: v.boolean(),
  }),
});
