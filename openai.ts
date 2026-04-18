import { action } from "./_generated/server";
import { v } from "convex/values";

export const getRecipes = action({
  args: { 
    ingredients: v.array(v.object({ name: v.string(), daysLeft: v.number() })) 
  },
  handler: async (ctx, args) => {
    
    const key = process.env.TOGETHER_API_KEY;
    
    const sorted = args.ingredients.sort((a, b) => a.daysLeft - b.daysLeft);
    const ingredientList = sorted.map(i => `${i.name} (${i.daysLeft} days left)`).join(", ");

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a chef. Suggest 3 recipes based on ingredients. Focus on items expiring soon. Return ONLY JSON." 
          },
          { 
            role: "user", 
            content: `I have: ${ingredientList}. Return JSON: {"recipes": [{"name": "...", "instructions": "...", "using_soon_to_expire": ["item1"]}]}` 
          }
        ],
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Together AI Error:", errorText);
        throw new Error(`AI Request failed: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content || "{}");
  },
});
