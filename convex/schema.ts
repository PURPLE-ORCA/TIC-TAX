import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transactions: defineTable({
    amount: v.number(), 
    type: v.union(v.literal("IN"), v.literal("OUT")),
    category: v.string(), // e.g., "Freelance", "Taxi", "Junk"
    taxAmount: v.number(),
    timestamp: v.number(),
  }).index("by_type", ["type"]),

  subscriptions: defineTable({
    name: v.string(),
    monthlyCost: v.number(),
    isActive: v.boolean(),
  }),
});
