import { action } from "./_generated/server";
import { v } from "convex/values";

export const getRecipes = action({
  args: {
    ingredients: v.array(v.object({ name: v.string(), daysLeft: v.number() })),
    prioritizeExpiring: v.optional(v.boolean()),
  },
  handler: async (ctx, { ingredients, prioritizeExpiring }) => {
    const key = process.env.TOGETHER_API_KEY;
    const sorted = ingredients.sort((a, b) => a.daysLeft - b.daysLeft);
    const ingredientList = sorted
      .map((i) => `${i.name} (${i.daysLeft} days left)`)
      .join(", ");

    const systemPrompt = prioritizeExpiring
      ? "You are a chef. Suggest 3 recipes that PRIORITIZE using ingredients expiring soonest. Focus especially on items with fewest days left. Return ONLY JSON."
      : "You are a chef. Suggest 3 recipes based on ingredients. Return ONLY JSON.";

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `I have: ${ingredientList}. Return JSON: {"recipes": [{"name": "...", "instructions": "short 1-2 sentence description", "using_soon_to_expire": ["item1"]}]}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Request failed: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content || "{}");
  },
});

// NEW — detailed recipe steps
export const getRecipeSteps = action({
  args: {
    recipeName: v.string(),
  },
  handler: async (ctx, { recipeName }) => {
    const key = process.env.TOGETHER_API_KEY;

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content: "You are a chef. Provide detailed recipe with ingredients list and step-by-step instructions. Return ONLY JSON.",
          },
          {
            role: "user",
            content: `Give me full detailed recipe for "${recipeName}". Return JSON: {"ingredients": ["2 cups flour", "1 tsp salt", ...], "steps": ["Step 1 description", "Step 2 description", ...]}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content || "{}");

    // use Unsplash for a food photo (free, no API key)
    const searchTerm = encodeURIComponent(recipeName);
    parsed.imageUrl = `https://source.unsplash.com/600x400/?${searchTerm},food`;

    return parsed;
  },
});

// NEW — freeform chat
export const chatWithAI = action({
  args: {
    message: v.string(),
    ingredients: v.string(),
    history: v.array(
      v.object({ role: v.string(), content: v.string() })
    ),
  },
  handler: async (ctx, { message, ingredients, history }) => {
    const key = process.env.TOGETHER_API_KEY;

    const messages = [
      {
        role: "system",
        content: `You are a friendly chef assistant. The user has these ingredients in their fridge: ${ingredients}. Help them with recipe ideas, cooking tips, healthy suggestions, or anything food-related. Keep replies under 150 words.`,
      },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages,
      }),
    });

    const data = await response.json();
    return { reply: data.choices[0].message.content };
  },
});
