import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    amount: v.number(), 
    type: v.union(v.literal("IN"), v.literal("OUT")),
    category: v.string(),
    taxAmount: v.number(),
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
