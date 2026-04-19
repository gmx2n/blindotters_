import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";
import { useState } from "react";

// words that indicate a liquid/sauce — those go on the side door shelves
const LIQUID_KEYWORDS = [
  "juice", "milk", "water", "soda", "drink", "wine", "beer", "coke", "pepsi",
  "sauce", "oil", "vinegar", "syrup", "dressing", "ketchup", "mustard",
  "mayo", "mayonnaise", "soy", "honey", "jam", "jelly", "butter", "cream",
  "yogurt", "yoghurt", "tea", "coffee", "smoothie", "lemonade", "nectar",
];

function isLiquid(name) {
  const lower = name.toLowerCase();
  return LIQUID_KEYWORDS.some((word) => lower.includes(word));
}

export default function HomePage() {
  const user = useQuery(api.users.getUser);
  const { results: posts } = usePaginatedQuery(
    api.posts.getPosts,
    {},
    { initialNumItems: 50 }
  );

  const usersPosts = posts.filter((post) => post.authorId === user?._id);

  // split into liquids and solids
  const liquids = usersPosts.filter((p) => isLiquid(p.name));
  const solids = usersPosts.filter((p) => !isLiquid(p.name));

  // split liquids between left and right doors
  const leftDoor = liquids.filter((_, i) => i % 2 === 0);
  const rightDoor = liquids.filter((_, i) => i % 2 === 1);

  return (
    <div
      className="min-h-[91vh] bg-center bg-no-repeat bg-cover relative"
      style={{
        backgroundImage:
          "url('https://media.discordapp.net/attachments/1495090293685489675/1495205095124504626/fridge.png?ex=69e565c2&is=69e41442&hm=238170bec51185e053c4ca471f08fa0752cd3ac3a4941f84460c9cb7c6def3a7&=&format=webp&quality=lossless&width=816&height=527')",
      }}
    >
      {/* LEFT DOOR — liquids & sauces */}
      <div className="absolute top-[20%] left-[5%] w-[15%] flex flex-col gap-3 items-center">
        {leftDoor.map((post) => (
          <PostItem className="w-50" key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

      {/* CENTER — solids */}
      <div className="absolute top-[15%] left-[25%] w-[50%] flex flex-wrap gap-3 justify-center content-start">
        {solids.map((post) => (
          <PostItem key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

      {/* RIGHT DOOR — liquids & sauces */}
      <div className="absolute top-[20%] right-[5%] w-[20%] flex flex-col gap-3 items-center">
        {rightDoor.map((post) => (
          <PostItem key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

      {/* AI recipes floating button */}
      <Link
        to="/chat"
        className="btn btn-success fixed bottom-6 right-6 z-50"
      >
        🍳 Get AI Recipes
      </Link>
    </div>
  );
}

function PostItem({ post, currentUserId }) {
  const deletePost = useMutation(api.posts.deletePost);
  const [hover, setHover] = useState(false);

  // format "added on" from convex _creationTime
  const addedDate = new Date(post._creationTime).toLocaleDateString();
  const expirationDate = post.expiration
    ? new Date(post.expiration).toLocaleDateString()
    : "n/a";

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* hover tooltip */}
      {hover && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap z-50">
          <div className="font-bold">{post.name}</div>
          <div>Expires: {expirationDate}</div>
          <div>Added: {addedDate}</div>
        </div>
      )}

      {/* image */}
      <img
        src={post.imageUrl}
        alt={post.name}
        className="w-10 h-10 object-cover rounded"
      />

      {/* small delete button — only visible on hover */}
      {post.authorId === currentUserId && hover && (
        <button
          onClick={() => deletePost({ postId: post._id })}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
}
