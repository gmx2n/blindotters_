import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// This tells the website how to get the list of food
export const getItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});

// This tells the website how to add new food
export const addItem = mutation({
  args: { name: v.string(), expiryDate: v.string(), category: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("items", { ...args });
  },
});

// This tells the website how to delete food
export const removeItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
