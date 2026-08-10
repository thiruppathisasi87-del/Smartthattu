import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type { GroceryList } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 45;

interface RequestBody {
  mealPlanText?: string;
  meals?: Array<{ name: string; items: string[] }>;
  familySize?: number;
  language?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  bn: "Bengali (বাংলা)",
  gu: "Gujarati (ગુજરાતી)",
  mr: "Marathi (मराठी)",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const mealsList =
      body.meals && body.meals.length
        ? body.meals.map((m, i) => `${i + 1}. ${m.name} — ${m.items.join(", ")}`).join("\n")
        : body.mealPlanText ?? "";

    const prompt = `You are an Indian kitchen assistant. Based on the meal plan below, generate a sorted, practical grocery list appropriate for an Indian kitchen. Quantities should be approximate for a family of ${body.familySize ?? 4}. Use Indian household units (kg, g, litres, dozen, bunch, packet) where appropriate. Group items into the following categories exactly:
- Vegetables
- Fruits
- Dairy
- Grains & Flours
- Pulses & Legumes (Dals)
- Spices & Masalas
- Proteins (meat, poultry, fish, eggs, paneer, tofu)
- Oils & Ghee
- Dry Fruits & Nuts
- Beverages
- Other (condiments, packaged goods)

Combine duplicates. Do not invent items. Skip items people usually already have at home (salt, sugar, water) unless obviously required.

=== MEAL PLAN ===
${mealsList}

Return STRICT JSON with shape:
{
  "categories": [
    { "category": "Vegetables", "items": ["2 kg onions", "1 kg tomatoes", "..."] },
    ...
  ]
}
Only include categories that have items.

${
  body.language && body.language !== "en"
    ? `IMPORTANT: Write every category header and grocery item in ${LANGUAGE_NAMES[body.language] ?? body.language} using the native script. JSON keys remain English.`
    : ""
}`;

    const data = await callOpenRouterJSON<GroceryList>({
      messages: [
        { role: "system", content: "You generate a practical Indian grocery list. Output ONLY JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return NextResponse.json<GroceryList>({
      categories: Array.isArray(data.categories) ? data.categories : [],
    });
  } catch (err) {
    console.error("grocery error", err);
    return NextResponse.json(
      { categories: [] } as GroceryList,
      { status: 200 }
    );
  }
}
