import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";
import { useState } from "react";

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

// maps ingredient names to files in the public folder
const LOCAL_IMAGES = {
  "apple juice": "/apple juice.png",
  "asparagus": "/asparagus.jpg",
  "beets": "/beets.png",
  "bread": "/bread.png",
  "brocolli": "/brocolli.png",
  "broccoli": "/brocolli.png",
  "carrot": "/carrot.png",
  "carrots": "/carrot.png",
  "corn": "/corn.png",
  "egg": "/egg.png",
  "eggs": "/egg.png",
  "eggplant": "/eggplant.png",
  "fruit": "/fruit .png",
  "green onion": "/green onion.png",
  "green onions": "/green onion.png",
  "lettuce": "/lettuce.png",
  "milk": "/milk.png",
  "pasta": "/pasta.png",
  "potato": "/potato.png",
  "potatoes": "/potato.png",
  "red pepper": "/redpepper.png",
  "redpepper": "/redpepper.png",
  "tomato": "/tomato.png",
  "tomatoes": "/tomato.png",
  "olive oil": "/virginoil (1).png",
  "oil": "/virginoil (1).png",
};

function getLocalImage(name) {
  const lower = name.toLowerCase().trim();
  // exact match first
  if (LOCAL_IMAGES[lower]) return LOCAL_IMAGES[lower];
  // partial match (e.g. "red bell pepper" matches "red pepper")
  for (const key in LOCAL_IMAGES) {
    if (lower.includes(key) || key.includes(lower)) return LOCAL_IMAGES[key];
  }
  return null;
}

export default function HomePage() {
  const user = useQuery(api.users.getUser);
  const { results: posts } = usePaginatedQuery(
    api.posts.getPosts,
    {},
    { initialNumItems: 50 }
  );

  const usersPosts = posts.filter((post) => post.authorId === user?._id);

  const liquids = usersPosts.filter((p) => isLiquid(p.name));
  const solids = usersPosts.filter((p) => !isLiquid(p.name));

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
      {/* LEFT DOOR */}
      <div className="absolute top-[20%] left-[5%] w-[15%] flex flex-col gap-4 items-center">
        {leftDoor.map((post) => (
          <PostItem key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

      {/* CENTER */}
      <div className="absolute top-[15%] left-[25%] w-[50%] flex flex-wrap gap-4 justify-center content-start">
        {solids.map((post) => (
          <PostItem key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

      {/* RIGHT DOOR */}
      <div className="absolute top-[20%] right-[5%] w-[15%] flex flex-col gap-4 items-center">
        {rightDoor.map((post) => (
          <PostItem key={post._id} post={post} currentUserId={user?._id} />
        ))}
      </div>

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

  const addedDate = new Date(post._creationTime).toLocaleDateString();
  const expirationDate = post.expiration
    ? new Date(post.expiration).toLocaleDateString()
    : "n/a";

  // try local image first, then fall back to the imageUrl from db
  const localImg = getLocalImage(post.name);
  const imgSrc = localImg || post.imageUrl;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap z-50">
          <div className="font-bold">{post.name}</div>
          <div>Expires: {expirationDate}</div>
          <div>Added: {addedDate}</div>
        </div>
      )}

      <img
        src={imgSrc}
        alt={post.name}
        className="w-20 h-20 object-contain"   // ← bigger! (was w-10 h-10)
      />

      {post.authorId === currentUserId && hover && (
        <button
          onClick={() => deletePost({ postId: post._id })}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
}
