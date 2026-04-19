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
  const chatWithAI = useAction(api.openai.chatWithAI);
  const getRecipeSteps = useAction(api.openai.getRecipeSteps);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [stepsData, setStepsData] = useState({});
  const [loadingSteps, setLoadingSteps] = useState({});

  const usersPosts = posts?.filter((post) => post.authorId === user?._id) || [];

  const sortedPosts = [...usersPosts].sort((a, b) => {
    const aDays = Math.ceil((new Date(a.expiration).getTime() - Date.now()) / 86400000);
    const bDays = Math.ceil((new Date(b.expiration).getTime() - Date.now()) / 86400000);
    return aDays - bDays;
  });

  const expiringItems = usersPosts.filter((p) => {
    const daysLeft = Math.ceil(
      (new Date(p.expiration).getTime() - Date.now()) / 86400000
    );
    return daysLeft <= 3 && daysLeft > 0;
  });

  const toggleIngredient = (name) => {
    setSelectedIngredients((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const clearSelection = () => setSelectedIngredients([]);

  const useSelectedInChat = () => {
    if (selectedIngredients.length === 0) return;
    const msg = `Give me a recipe using these ingredients: ${selectedIngredients.join(", ")}`;
    sendChat(msg);
    setSelectedIngredients([]);
  };

  const useExpiringInChat = () => {
    if (expiringItems.length === 0) {
      sendChat("What ingredients in my fridge are expiring soon and what can I make with them?");
      return;
    }
    const names = expiringItems.map((p) => p.name).join(", ");
    sendChat(`Give me a recipe that uses these ingredients expiring soon: ${names}`);
  };

  const sendChat = async (customMessage) => {
    const msg = customMessage || chatInput;
    if (!msg.trim()) return;
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const ingredientList = usersPosts
        .map((p) => {
          const days = Math.ceil(
            (new Date(p.expiration).getTime() - Date.now()) / 86400000
          );
          return `${p.name} (${days} days left)`;
        })
        .join(", ");

      const res = await chatWithAI({
        message: msg,
        ingredients: ingredientList,
        history: chatMessages,
      });
      setChatMessages([...newMessages, { role: "assistant", content: res.reply }]);
    } catch (e) {
      console.error(e);
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Check your TOGETHER_API_KEY!" },
      ]);
    }
    setChatLoading(false);
  };

  const extractRecipeName = (content) => {
    const boldMatch = content.match(/\*\*([^*]+)\*\*/);
    if (boldMatch) return boldMatch[1].trim();
    const firstLine = content.split("\n")[0].replace(/[#*:]/g, "").trim();
    return firstLine.length > 3 && firstLine.length < 60 ? firstLine : null;
  };

  const loadRecipeSteps = async (messageIndex, recipeName) => {
    if (stepsData[messageIndex]) {
      setStepsData((prev) => {
        const copy = { ...prev };
        delete copy[messageIndex];
        return copy;
      });
      return;
    }
    setLoadingSteps((prev) => ({ ...prev, [messageIndex]: true }));
    try {
      const res = await getRecipeSteps({ recipeName });
      setStepsData((prev) => ({ ...prev, [messageIndex]: res }));
    } catch (e) {
      console.error(e);
      alert("Couldn't load recipe steps. Try again!");
    }
    setLoadingSteps((prev) => ({ ...prev, [messageIndex]: false }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 h-[92vh] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">👨‍🍳 Chef AI</h1>
          <p className="text-xs text-gray-500">
            {usersPosts.length} ingredients
            {expiringItems.length > 0 && (
              <span className="ml-2 text-red-500 font-bold">
                • {expiringItems.length} expiring soon
              </span>
            )}
          </p>
        </div>
        <Link to="/" className="btn btn-sm">← Back</Link>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-3">👨‍🍳</div>
                <h3 className="font-bold text-lg mb-2">Hi! I'm Chef AI</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm">
                  Ask me anything or click an ingredient on the right to add it to your message.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {[
                    "What's a healthy dinner I can make?",
                    "Suggest a 15-minute meal",
                    "Give me a comfort food recipe",
                    "What can I bake?",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => sendChat(s)}
                      className="text-xs px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const recipeName =
                  msg.role === "assistant" ? extractRecipeName(msg.content) : null;
                return (
                  <div key={i}>
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-success text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <div className="whitespace-pre-line text-sm">{msg.content}</div>
                        {msg.role === "assistant" && recipeName && (
                          <button
                            onClick={() => loadRecipeSteps(i, recipeName)}
                            className="btn btn-xs btn-outline mt-3"
                            disabled={loadingSteps[i]}
                          >
                            {loadingSteps[i]
                              ? "Loading..."
                              : stepsData[i]
                              ? "Hide steps"
                              : "📖 Step-by-step recipe"}
                          </button>
                        )}
                      </div>
                    </div>

                    {stepsData[i] && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <h4 className="font-bold text-lg mb-3">{recipeName} — Full Recipe</h4>
                        {stepsData[i].imageUrl && (
                          <img
                            src={stepsData[i].imageUrl}
                            alt={recipeName}
                            className="w-full h-48 object-cover rounded-xl mb-4"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        )}
                        {stepsData[i].ingredients?.length > 0 && (
                          <>
                            <h5 className="font-bold mb-2 text-sm uppercase text-gray-600">Ingredients</h5>
                            <ul className="space-y-1 mb-4 text-sm">
                              {stepsData[i].ingredients.map((ing, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-amber-600">•</span>
                                  <span>{ing}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {stepsData[i].steps?.length > 0 && (
                          <>
                            <h5 className="font-bold mb-2 text-sm uppercase text-gray-600">Steps</h5>
                            <ol className="space-y-2 text-sm">
                              {stepsData[i].steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="font-bold text-amber-600 flex-shrink-0">{idx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedIngredients.length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-green-50 flex items-center gap-2">
              <span className="text-xs font-bold text-green-700">
                {selectedIngredients.length} selected:
              </span>
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedIngredients.map((n) => (
                  <span key={n} className="text-xs bg-white px-2 py-1 rounded-full border border-green-200">
                    {n}
                  </span>
                ))}
              </div>
              <button onClick={clearSelection} className="btn btn-xs btn-ghost">Clear</button>
              <button onClick={useSelectedInChat} className="btn btn-xs btn-success">Send →</button>
            </div>
          )}

          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              <button
                onClick={useExpiringInChat}
                className="btn btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                disabled={chatLoading}
              >
                ⚠️ Use expiring ingredients
              </button>
              <button
                onClick={() => sendChat("Give me a healthy recipe idea")}
                className="btn btn-xs btn-outline"
                disabled={chatLoading}
              >
                🥗 Something healthy
              </button>
              <button
                onClick={() => sendChat("Give me a quick 20-minute meal")}
                className="btn btn-xs btn-outline"
                disabled={chatLoading}
              >
                ⏱ Quick meal
              </button>
            </div>
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
                onClick={() => sendChat()}
                disabled={chatLoading || !chatInput.trim()}
                className="btn btn-success"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg">Your Fridge</h2>
            <p className="text-xs text-gray-500">Click to add to chat</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sortedPosts.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-400 text-sm mb-3">Fridge is empty!</p>
                <Link to="/create-post" className="btn btn-sm btn-primary">
                  Add ingredients
                </Link>
              </div>
            ) : (
              sortedPosts.map((post) => {
                const daysLeft = Math.ceil(
                  (new Date(post.expiration).getTime() - Date.now()) / 86400000
                );
                const imgSrc = getLocalImage(post.name) || post.imageUrl;
                const isSelected = selectedIngredients.includes(post.name);
                const isExpiring = daysLeft <= 2;

                return (
                  <button
                    key={post._id}
                    onClick={() => toggleIngredient(post.name)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border-2 transition text-left ${
                      isSelected
                        ? "bg-green-100 border-green-400"
                        : isExpiring
                        ? "bg-red-50 border-red-200 hover:bg-red-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <img src={imgSrc} alt={post.name} className="w-10 h-10 object-contain flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{post.name}</div>
                      <div className={`text-xs ${isExpiring ? "text-red-600 font-bold" : "text-gray-500"}`}>
                        {daysLeft <= 0
                          ? "Expired!"
                          : daysLeft === 1
                          ? "Expires tomorrow"
                          : `${daysLeft} days left`}
                      </div>
                    </div>
                    {isSelected && <span className="text-green-600 text-lg">✓</span>}
                  </button>
                );
              })
            )}
          </div>

          {sortedPosts.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <Link to="/create-post" className="btn btn-sm btn-outline w-full">
                + Add more
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
