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

  const [activeTab, setActiveTab] = useState("recipes");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prioritizeExpiring, setPrioritizeExpiring] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [recipeSteps, setRecipeSteps] = useState({});
  const [loadingSteps, setLoadingSteps] = useState({});

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const usersPosts = posts?.filter((post) => post.authorId === user?._id) || [];
  const expiringItems = usersPosts.filter((p) => {
    const daysLeft = Math.ceil(
      (new Date(p.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 3 && daysLeft > 0;
  });

  const fetchRecipes = async () => {
    setLoading(true);
    setExpandedRecipe(null);
    setRecipeSteps({});
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
      alert("Error fetching recipes. Check your TOGETHER_API_KEY!");
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

  const sendChat = async (customMessage) => {
    const msg = customMessage || chatInput;
    if (!msg.trim()) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const ingredientList = usersPosts.map((p) => p.name).join(", ");
      const res = await chatWithAI({
        message: msg,
        ingredients: ingredientList,
        history: chatMessages,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again!" },
      ]);
    }
    setChatLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">👨‍🍳 Chef AI</h1>
          <p className="text-sm text-gray-500">
            {usersPosts.length} ingredients in your fridge
            {expiringItems.length > 0 && (
              <span className="ml-2 text-red-500 font-bold">
                • {expiringItems.length} expiring soon
              </span>
            )}
          </p>
        </div>
        <Link to="/" className="btn btn-sm">← Back to Fridge</Link>
      </div>

      {/* TABS */}
      <div className="flex border-b-2 border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "recipes"
              ? "border-b-4 border-success text-success -mb-0.5"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          🍳 Recipes
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === "chat"
              ? "border-b-4 border-success text-success -mb-0.5"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          💬 Chat
        </button>
      </div>

      {/* RECIPES TAB */}
      {activeTab === "recipes" && (
        <div>
          {/* INGREDIENTS PREVIEW */}
          {usersPosts.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-3">Your fridge is empty!</p>
              <Link to="/create-post" className="btn btn-primary">
                Add ingredients
              </Link>
            </div>
          ) : (
            <>
              <details className="mb-6 bg-base-200 rounded-xl p-4" open>
                <summary className="font-semibold cursor-pointer">
                  Your ingredients ({usersPosts.length})
                </summary>
                <div className="flex flex-wrap gap-2 mt-3">
                  {usersPosts.map((post) => {
                    const daysLeft = Math.ceil(
                      (new Date(post.expiration).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const imgSrc = getLocalImage(post.name) || post.imageUrl;
                    return (
                      <div
                        key={post._id}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                          daysLeft <= 2
                            ? "bg-red-100 border-red-300 text-red-700"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <img src={imgSrc} alt={post.name} className="w-5 h-5 rounded-full object-cover" />
                        {post.name}
                        <span className="text-xs opacity-70">
                          {daysLeft <= 0 ? "Expired" : `${daysLeft}d`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>

              {/* GET RECIPES SECTION */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">Generate recipes</h3>
                    <p className="text-sm text-gray-600">AI will suggest 3 dishes</p>
                  </div>
                  <button
                    onClick={fetchRecipes}
                    disabled={loading || usersPosts.length === 0}
                    className="btn btn-success"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Thinking...
                      </>
                    ) : (
                      <>✨ Generate</>
                    )}
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prioritizeExpiring}
                    onChange={(e) => setPrioritizeExpiring(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-success"
                  />
                  <span className="text-sm">
                    Focus on ingredients expiring soon
                    {expiringItems.length > 0 && (
                      <span className="ml-1 text-red-500 font-bold">
                        ({expiringItems.length})
                      </span>
                    )}
                  </span>
                </label>
              </div>

              {/* RECIPE CARDS */}
              {recipes.length > 0 && (
                <div className="space-y-3">
                  {recipes.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <button
                        onClick={() => toggleRecipeSteps(i, r)}
                        className="w-full p-5 text-left hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800">{r.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{r.instructions}</p>
                            {r.using_soon_to_expire?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {r.using_soon_to_expire.map((ing) => (
                                  <span
                                    key={ing}
                                    className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium"
                                  >
                                    ⚠ {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-2xl text-gray-400 flex-shrink-0">
                            {expandedRecipe === i ? "−" : "+"}
                          </div>
                        </div>
                      </button>

                      {/* EXPANDED */}
                      {expandedRecipe === i && (
                        <div className="border-t border-gray-100 p-5 bg-gray-50">
                          {loadingSteps[i] ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="loading loading-spinner loading-sm"></span>
                              Writing recipe...
                            </div>
                          ) : recipeSteps[i] ? (
                            <div className="grid md:grid-cols-2 gap-5">
                              {recipeSteps[i].imageUrl && (
                                <img
                                  src={recipeSteps[i].imageUrl}
                                  alt={r.name}
                                  className="w-full h-48 md:h-full object-cover rounded-xl"
                                />
                              )}
                              <div>
                                <h4 className="font-bold mb-2 text-sm uppercase text-gray-500">
                                  Ingredients
                                </h4>
                                <ul className="space-y-1 mb-4 text-sm">
                                  {recipeSteps[i].ingredients?.map((ing, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="text-success">•</span>
                                      <span>{ing}</span>
                                    </li>
                                  ))}
                                </ul>

                                <h4 className="font-bold mb-2 text-sm uppercase text-gray-500">
                                  Steps
                                </h4>
                                <ol className="space-y-2 text-sm">
                                  {recipeSteps[i].steps?.map((step, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="font-bold text-success flex-shrink-0">
                                        {idx + 1}.
                                      </span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === "chat" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[70vh]">
          {/* CHAT MESSAGES */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-3">👨‍🍳</div>
                <h3 className="font-bold text-lg mb-2">Hi! I'm Chef AI</h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm">
                  Ask me anything about cooking with what you have in your fridge!
                </p>

                {/* SUGGESTION CHIPS */}
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {[
                    "What's a healthy dinner I can make?",
                    "Can you make something with just eggs?",
                    "What expires soonest?",
                    "Suggest a 15-minute meal",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendChat(suggestion)}
                      className="text-xs px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-success text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CHAT INPUT */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask Chef AI..."
              className="input input-bordered flex-1"
              disabled={chatLoading}
            />
            <button
              onClick={() => sendChat()}
              disabled={chatLoading || !chatInput.trim()}
              className="btn btn-success"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
