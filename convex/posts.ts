import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createPost = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    expiration: v.string(),
    imageUrl: v.string(),   // ← add this
  },
  handler: async (ctx, { name, quantity, expiration, imageUrl }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("post", {
      name,
      quantity,
      expiration,
      imageUrl,              // ← add this
      authorId: userId,
    });
  },
});

export const getPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query("post").order("desc").paginate(paginationOpts);
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(postId);
  },
});

export const getPost = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    return post;
  },
});