import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "./../convex/_generated/api";

export default function App() {
  const [input, setInput] = useState("");
  const items = useQuery(api.fridge.getItems) || [];
  const addItem = useMutation(api.fridge.addItem);
  const removeItem = useMutation(api.fridge.removeItem);
  const getRecipes = useAction(api.openai.getRecipes);
  
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!input.trim()) return;
    
    // Default shelf life logic (can be expanded later)
    const shelfLife = 5; 
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + shelfLife);

    await addItem({
      name: input,
      category: "Food",
      expiryDate: expiry.toISOString(),
    });
    setInput("");
  };11

  const fetchRecipes = async () => {
    setLoading(true);
    const ingredientData = items.map(i => ({
      name: i.name,
      daysLeft: Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }));

    try {
      const res = await getRecipes({ ingredients: ingredientData });
      setRecipes(res.recipes || []);
    } catch (e) {
      console.error(e);
      alert("Make sure you added your OpenAI API Key to the Convex Dashboard!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Smart Fridge AI</h1>
      
      <div className="flex gap-2 mb-8">
        <input 
          className="border p-2 flex-grow rounded shadow-sm"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="What did you buy? (e.g. Steak, Milk)"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleAdd}>Add</button>
      </div>

      <div className="grid gap-4 mb-8">
        <h2 className="text-xl font-semibold">My Fridge Inventory</h2>
        {items.length === 0 && <p className="text-gray-400 italic">Your fridge is empty.</p>}
        {items.map((item) => {
          const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return (
            <div key={item._id} className="flex justify-between items-center border p-3 rounded shadow-sm bg-white">
              <div>
                <span className="font-medium text-lg">{item.name}</span>
                <span className={`ml-3 text-sm ${daysLeft < 2 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                  {daysLeft <= 0 ? "Expired!" : `Expires in ${daysLeft} days`}
                </span>
              </div>
              <button onClick={() => removeItem({ id: item._id })} className="text-red-400 hover:text-red-600">Remove</button>
            </div>
          );
        })}
      </div>

      <button 
        className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg disabled:bg-gray-400 hover:bg-green-700 transition-all"
        onClick={fetchRecipes} 
        disabled={loading || items.length === 0}
      >
        {loading ? "Chef AI is thinking..." : "Get AI Recipes"}
      </button>

      <div className="mt-8 space-y-6">
        {recipes.map((r, i) => (
          <div key={i} className="border-2 border-green-100 p-5 rounded-2xl bg-green-50 shadow-sm">
            <h3 className="font-bold text-xl text-green-800">{r.name}</h3>
            <p className="text-gray-700 mt-3 whitespace-pre-line">{r.instructions}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {r.using_soon_to_expire?.map((ing: string) => (
                <span key={ing} className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                  Uses: {ing}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
