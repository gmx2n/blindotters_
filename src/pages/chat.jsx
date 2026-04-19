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
  const getRecipeSteps = useAction(api.openai.getRecipeSteps);
  const chatWithAI = useAction(api.openai.chatWithAI);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prioritizeExpiring, setPrioritizeExpiring] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState({});
  const [loadingSteps, setLoadingSteps] = useState({});

  // chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

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

      const res = await getRecipes({
        ingredients: ingredientData,
        prioritizeExpiring,
      });
      setRecipes(res.recipes || []);
    } catch (e) {
      console.error(e);
      alert("Make sure you added your TOGETHER_API_KEY to the Convex Dashboard!");
    }
    setLoading(false);
  };

  const toggleRecipeSteps = async (index, recipe) => {
    if (expandedRecipe === index) {
      setExpandedRecipe(null);
      return;
    }
    setExpandedRecipe(index);
    if (!recipeSteps[index]) {
      setLoadingSteps({ ...loadingSteps, [index]: true });
      try {
        const res = await getRecipeSteps({ recipeName: recipe.name });
        setRecipeSteps({ ...recipeSteps, [index]: res });
      } catch (e) {
        console.error(e);
      }
      setLoadingSteps({ ...loadingSteps, [index]: false });
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const ingredientList = usersPosts.map((p) => p.name).join(", ");
      const res = await chatWithAI({
        message: userMsg,
        ingredients: ingredientList,
        history: chatMessages,
      });
      setChatMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again!" },
      ]);
    }
    setChatLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mx-4">AI Recipe Suggestions</h1>
        <Link to="/" className="btn btn-sm">← Back to Fridge</Link>
      </div>

      {/* INGREDIENTS */}
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
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    daysLeft <= 2
                      ? "bg-red-100 border-red-300 text-red-700"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                >
                  <img src={imgSrc} alt={post.name} className="w-5 h-5 rounded-full object-cover" />
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

      {/* TOGGLE: prioritize expiring */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <input
          type="checkbox"
          id="expiring"
          checked={prioritizeExpiring}
          onChange={(e) => setPrioritizeExpiring(e.target.checked)}
          className="checkbox"
        />
        <label htmlFor="expiring" className="cursor-pointer">
          ⚠️ Prioritize recipes that use ingredients expiring soon
        </label>
      </div>

      {/* GET RECIPES BUTTON */}
      <button
        className="w-full btn btn-success text-lg p-4 mb-8"
        onClick={fetchRecipes}
        disabled={loading || usersPosts.length === 0}
      >
        {loading ? "Chef AI is thinking..." : "Get AI Recipes"}
      </button>

      {/* RECIPES LIST */}
      <div className="space-y-4 mb-10">
        {recipes.map((r, i) => (
          <div
            key={i}
            className="border-2 border-green-100 p-5 rounded-2xl bg-green-50 shadow-sm"
          >
            <div
              className="cursor-pointer hover:opacity-80"
              onClick={() => toggleRecipeSteps(i, r)}
            >
              <h3 className="font-bold text-xl text-green-800">
                {r.name} {expandedRecipe === i ? "▼" : "▶"}
              </h3>
              <p className="text-gray-700 mt-3 whitespace-pre-line">{r.instructions}</p>

              {r.using_soon_to_expire?.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center mt-3">
                  <span className="text-xs font-bold">Uses expiring:</span>
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
              <p className="text-xs text-blue-600 mt-3 underline">
                {expandedRecipe === i ? "Hide step-by-step" : "Click for step-by-step instructions"}
              </p>
            </div>

            {/* EXPANDED STEPS */}
            {expandedRecipe === i && (
              <div className="mt-4 pt-4 border-t border-green-200">
                {loadingSteps[i] ? (
                  <p className="text-gray-500 italic">Chef AI is writing the recipe...</p>
                ) : recipeSteps[i] ? (
                  <div>
                    {recipeSteps[i].imageUrl && (
                      <img
                        src={recipeSteps[i].imageUrl}
                        alt={r.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="font-bold mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside mb-4">
                      {recipeSteps[i].ingredients?.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))}
                    </ul>
                    <h4 className="font-bold mb-2">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {recipeSteps[i].steps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CHAT BOX */}
      <div className="border-2 border-blue-100 rounded-2xl bg-blue-50 p-4">
        <h2 className="text-xl font-bold mb-3">💬 Chat with Chef AI</h2>
        <p className="text-sm text-gray-600 mb-3">
          Ask anything! "Can you use just eggs and cheese?" or "Give me a healthy idea"
        </p>

        {/* messages */}
        <div className="bg-white rounded-lg p-3 mb-3 max-h-80 overflow-y-auto space-y-2">
          {chatMessages.length === 0 && (
            <p className="text-gray-400 italic text-sm">Start the conversation...</p>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 ml-8 text-right"
                  : "bg-gray-100 mr-8"
              }`}
            >
              <div className="text-xs font-bold mb-1">
                {msg.role === "user" ? "You" : "Chef AI"}
              </div>
              <div className="whitespace-pre-line text-sm">{msg.content}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="bg-gray-100 mr-8 p-2 rounded-lg text-sm italic text-gray-500">
              Chef AI is typing...
            </div>
          )}
        </div>

        {/* input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Ask Chef AI anything..."
            className="input input-bordered flex-1"
            disabled={chatLoading}
          />
          <button
            onClick={sendChat}
            disabled={chatLoading || !chatInput.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
