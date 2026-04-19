import { action } from "./_generated/server";
import { v } from "convex/values";

export const getRecipes = action({
  args: {
    ingredients: v.array(
      v.object({ name: v.string(), daysLeft: v.number() })
    ),
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
            content: "You are a professional chef. Return ONLY valid JSON with no extra text, no markdown code blocks, no explanations.",
          },
          {
            role: "user",
            content: `Write a detailed recipe for "${recipeName}". Return ONLY this JSON format: {"ingredients": ["2 cups flour", "1 tsp salt", "3 eggs"], "steps": ["Preheat the oven to 350F", "Mix the dry ingredients in a bowl", "Add eggs and stir"]}. Include 5-10 ingredients and 4-8 steps.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content || "{}";

    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = { ingredients: [], steps: [content] };
      }
    }

    const searchTerm = encodeURIComponent(recipeName.toLowerCase().replace(/[^a-z ]/g, ""));
    parsed.imageUrl = `https://loremflickr.com/600/400/${searchTerm},food`;

    return parsed;
  },
});

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
        content: `You are a friendly chef assistant. The user has these ingredients in their fridge: ${ingredients}. Help them with recipe ideas, cooking tips, or food questions. When suggesting a recipe, give it a clear title on the first line in **bold markdown** format like **Recipe Name**. Keep replies under 200 words.`,
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

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const data = await response.json();
    return { reply: data.choices[0].message.content };
  },
});
