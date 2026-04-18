import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

export default function HomePage() {
  const user = useQuery(api.users.getUser);
  const { results: posts, status, loadMore } = usePaginatedQuery(
    api.posts.getPosts,
    {},
    { initialNumItems: 10 }
  );

  const usersPosts = posts.filter((post) => post.authorId === user?._id);

  return (
    <div className="min-h-[92vh] bg-cover bg-center"
      style={{ backgroundImage: "url('https://media.discordapp.net/attachments/1495090293685489675/1495205095124504626/fridge.png?ex=69e565c2&is=69e41442&hm=238170bec51185e053c4ca471f08fa0752cd3ac3a4941f84460c9cb7c6def3a7&=&format=webp&quality=lossless&width=816&height=527')" }}>
      <div className="container m-10 p-4">
        <div className="flex flex-wrap gap-2">
          {usersPosts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>

      </div>
    </div>
  );
}

function Post({ post }) {
  const user = useQuery(api.users.getUser);
  const deletePost = useMutation(api.posts.deletePost);

  return (
    <div className="mb-2 p-3 border rounded bg-white/80 flex flex-col items-center gap-2 w-40">

      {/* auto photo of ingredient */}
      <img
        src={post.imageUrl}
        alt={post.name}
        className="w-32 h-32 object-cover rounded-lg"
      />

      <span className="font-semibold text-gray-800 text-center">{post.name}</span>

      {post.authorId === user?._id && (
        <button
          className="btn btn-xs btn-error"
          onClick={() => deletePost({ postId: post._id })}
        >
          Delete
        </button>
      )}
    </div>
  );
}