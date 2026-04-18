import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useParams } from "react-router";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function PostViewPage() {
  const { postId } = useParams();
  const post = useQuery(api.posts.getPost, { postId });
  const comment = useQuery(api.comments.getCommentsForPost, {
    postId,
  });

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
      <p>{post.quantity}</p>
      <p>expiration date: {post.expiration}</p>

      <Unauthenticated>
        <div>you must be logged in...</div>
      </Unauthenticated>
    </div>
  );
}

// function CommentList({ postId }) {
//   const comments = useQuery(api.comments.getCommentsForPost, { postId });
//   const deleteComment = useMutation(api.comments.deleteComment);
//   return (
//     <div className="flex-col">
//       {comments.map((c) => (
//         <div key={c._id} className="space-x-3 my-3">
//           <div className="flex">
//             <div className="mr-3">{c.authorName}</div>
//             <div className="w-24">{"⭐".repeat(c.rating)}</div>
//           </div>
//           <div className="w-200">{c.content}</div>
//           <div className="flex">
//             <div className="grow"></div>
//             <button
//               className="btn btn-outline btn-xs btn-error ml-4"
//               onClick={() => deleteComment({ commentId: c._id })}
//             >
//               x
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CommentForm({ postId }) {
//   const createComment = useMutation(api.comments.createComment);
//   const [rating, setRating] = useState(3);
//   return (
//     <div className="flex">
//       <form
//         className="input justify-end w-120"
//         onSubmit={async (e) => {
//           e.preventDefault();
//           const content = e.currentTarget.content.value;
//           e.target.reset();

//           await createComment({
//             content,
//             postId,
//             rating: rating,
//           });
//         }}
//       >
//         <div className="rating">
//           <div
//             onClick={() => setRating(1)}
//             className="mask mask-star cursor-pointer"
//             aria-label="1 star"
//             aria-current={1 === rating}
//           ></div>
//           <div
//             onClick={() => setRating(2)}
//             className="mask mask-star cursor-pointer"
//             aria-label="2 star"
//             aria-current={2 === rating}
//           ></div>
//           <div
//             className="mask mask-star cursor-pointer"
//             aria-label="3 star"
//             aria-current={3 === rating}
//           ></div>
//           <div
//             onClick={() => setRating(4)}
//             className="mask mask-star cursor-pointer"
//             aria-label="4 star"
//             aria-current={4 === rating}
//           ></div>
//           <div
//             onClick={() => setRating(5)}
//             className="mask mask-star cursor-pointer"
//             aria-label="5 star"
//             aria-current={5 === rating}
//           ></div>
//         </div>
//         <input name="content" placeholder="Type here" />
//         <button>POST</button>
//       </form>
//     </div>
//   );
// }
