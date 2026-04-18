import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

export default function HomePage({ post }) {
  const user = useQuery(api.users.getUser);
  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(api.posts.getPosts, {}, { initialNumItems: 3 });
  const usersPosts = posts.filter(post => post.authorId === user?._id);

  return (
    
    <div className="min-h-[91vh] bg-[url('https://media.discordapp.net/attachments/1495090293685489675/1495136667382583417/fridge_copy.jpg?ex=69e52607&is=69e3d487&hm=3fe34f836dbab665e5727e37f469ad65b328379e096975d12eac91688659dbc2&=&format=webp&width=816&height=527')] bg-cover bg-center bg-no-repeat">
      <div className="container m-10 p-4">
        <div className="text-lg grid grid-cols-3 text-gray-600 mb-8">
          {usersPosts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
          <img className="w-20" src="brocolli.png"></img>
        </div>
      </div>
    </div>
  );
}

function Post({ post }) {
  const user = useQuery(api.users.getUser);
  const deletePost = useMutation(api.posts.deletePost);

  return (
    <div className="mb-4 m-1 p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-2">{post.content}</p>
      <div className="flex items-end">
        <span className="text-sm text-gray-500">By {post.authorName}</span>
        <div className="grow"></div>
        {post.authorId === user?._id && (
          <button
            className="btn btn-xs btn-error"
            onClick={() => deletePost({ postId: post._id })}
          >
            Delete
          </button>
        )}
        <Link to={`/posts/${post._id}`} className="btn btn-xs ml-2 btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}
