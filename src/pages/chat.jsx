import { useState } from "react";
import { usePaginatedQuery, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

const LOCAL_IMAGES = {
  "apple juice": "/apple juice.png",
  "apple": "/apple.png",
  "asparagus": "/asparagus.png",
  "avocado": "/avocado.png",
  "beets": "/beets.png",
  "bread": "/bread.png",
  "brocolli": "/brocolli.png",
  "broccoli": "/brocolli.png",
  "carrot": "/carrot.png",
  "carrots": "/carrot.png",
  "corn": "/corn.png",
  "chicken": "/chicken.png",
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
  "strawberry": "/strawberry.png",
  "tomato": "/tomato.png",
  "tomatoes": "/tomato.png",
  "olive oil": "/virginoil (1).png",
  "oil": "/virginoil (1).png",
};

function getLocalImage(name) {
  const lower = name.toLowerCase().trim();
  if (LOCAL_IMAGES[lower]) return LOCAL_IMAGES[lower];
  for (const key in LOCAL_IMAGES) {
    if (lower.includes(key) || key.includes(lower)) return LOCAL_IMAGES[key];
  }
  return null;
}

export default function ChatPage() {
  const user = useQuery(api.users.getUser);
  const { results: posts } = usePaginatedQuery(
    api.posts.getPosts,
    {},
    { initialNumItems: 50 }
  );
  const getRecipes = useAction(api.openai.getRecipes);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const usersPosts = posts?.filter((post) => post.authorId === user?._id) || [];

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const ingredientData = usersPosts.map((post) => ({
        name: post.name,
        daysLeft: Math.ceil(
          (new Date(post.expiration).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
        ),
      }));

      const res = await getRecipes({ ingredients: ingredientData });
      setRecipes(res.recipes || []);
    } catch (e) {
      console.error(e);
      alert("Make sure you added your TOGETHER_API_KEY to the Convex Dashboard!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mx-4">AI Recipe Suggestions</h1>
        <Link to="/" className="btn btn-sm">← Back to Fridge</Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Your Ingredients</h2>
        {usersPosts.length === 0 ? (
          <p className="text-gray-400 italic">
            No ingredients yet. <Link to="/create-post" className="text-blue-500 underline">Add some!</Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {usersPosts.map((post) => {
              const daysLeft = Math.ceil(
                (new Date(post.expiration).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
              );
              const imgSrc = getLocalImage(post.name) || post.imageUrl;

              return (
                <div
                  key={post._id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${daysLeft <= 2
                    ? "bg-red-100 border-red-300 text-red-700"
                    : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                >
                  <img
                    src={imgSrc}
                    alt={post.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  {post.name}
                  <span className="text-xs opacity-70">
                    {daysLeft <= 0 ? "Expired!" : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        className="w-full btn btn-success text-lg p-4 mb-8"
        onClick={fetchRecipes}
        disabled={loading || usersPosts.length === 0}
      >
        {loading ? "Chef AI is thinking..." : "Get AI Recipes"}
      </button>

      <div className="space-y-6">
        {recipes.map((r, i) => (
          <div
            key={i}
            className="border-2 border-green-100 p-5 rounded-2xl bg-green-50 shadow-sm"
          >
            <h3 className="font-bold text-xl text-green-800">{r.name}</h3>
            <p className="text-gray-700 mt-3 whitespace-pre-line">{r.instructions}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {r.using_soon_to_expire?.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs font-bold">Uses:</span>
                  {r.using_soon_to_expire.map((ing) => (
                    <span
                      key={ing}
                      className="bg-secondary text-xs px-2 py-1 rounded-full font-bold"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
