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
    <div className="min-h-[96vh] bg-cover bg-center"
      style={{ backgroundImage: "url('https://media.discordapp.net/attachments/1495090293685489675/1495204039632359515/fridge.png?ex=69e564c6&is=69e41346&hm=3c67a35c5ab8e1220accc94af3920f4aeb5249e364c2b54120a4cd14cc93e30e&=&format=webp&quality=lossless&width=816&height=527')" }}>
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