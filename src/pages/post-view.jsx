import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useParams } from "react-router";
import { api } from "../../convex/_generated/api";

export default function PostViewPage() {
  const { postId } = useParams();
  const post = useQuery(api.posts.getPost, { postId });

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Post Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{post.name}</h1>
      <p>Quantity: {post.quantity}</p>
      <p>Expiration date: {post.expiration}</p>

      <Unauthenticated>
        <div>you must be logged in...</div>
      </Unauthenticated>
    </div>
  );
}