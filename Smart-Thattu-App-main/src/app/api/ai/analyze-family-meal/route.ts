import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type { FamilyMember, MealFoodItem, MealType } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी, Devanagari script)",
  ta: "Tamil (தமிழ், Tamil script)",
  te: "Telugu (తెలుగు, Telugu script)",
  bn: "Bengali (বাংলা, Bengali script)",
  gu: "Gujarati (ગુજરાતી, Gujarati script)",
  mr: "Marathi (मराठी, Devanagari script)",
};

interface RequestBody {
  mealType: MealType;
  foods: MealFoodItem[];
  family: FamilyMember[];
  language?: string;
}

export interface PersonalizedPlate {
  memberId: string;
  memberName: string;
  portions: Array<{
    food: string;
    grams: number;
    percentage: number;
  }>;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
  suggestion: string;
  warnings: string[];
  portionChanges: Array<{
    action: "reduced" | "increased" | "avoided" | "added";
    items: string[];
  }>;
}

export interface FamilyMealAnalysis {
  plates: PersonalizedPlate[];
  mealSummary: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    if (!body.foods?.length) {
      return NextResponse.json({ error: "No foods provided" }, { status: 400 });
    }
    if (!body.family?.length) {
      return NextResponse.json({ error: "No family members" }, { status: 400 });
    }

    const foodsList = body.foods
      .map((f, i) => `${i + 1}. ${f.name}${f.quantity ? ` — ${f.quantity}` : ""}`)
      .join("\n");

    const familyList = body.family
      .map(
        (m, i) =>
          `${i + 1}. ${m.name} (id: "${m.id}") — ${m.age}yo ${m.gender}, activity: ${m.activityLevel}, health: ${m.healthCategory}, conditions: ${m.medicalConditions.join(", ") || "none"}${m.goal ? `, goal: ${m.goal}` : ""}`
      )
      .join("\n");

    const systemPrompt = `You are an expert Indian nutritionist for SmartThattu. A family cooked ONE meal together. You must create PERSONALIZED PLATES for each family member from the SAME set of dishes, adjusting portions based on each person's age, health conditions, activity level, and goals. Each plate uses the same foods but in different proportions. Think like a caring Indian mother serving food — she gives more rice to the growing teenager, less rice to the diabetic elder, extra dal to the pregnant daughter, etc.`;

    const userPrompt = `The family cooked these dishes for ${body.mealType.toUpperCase()}:

=== DISHES COOKED ===
${foodsList}

=== FAMILY MEMBERS ===
${familyList}

=== TASK ===
Create a personalized plate for EACH family member. For each person:
1. Distribute the SAME dishes but adjust portions (in grams and %) based on their health needs
2. Calculate total calories, protein, carbs, fat, fiber for THEIR plate
3. Give a health score (0-100) for how suitable this meal is for them
4. Give ONE short practical suggestion (Indian cooking context)
5. List any warnings if their conditions conflict with any dish
6. Note what was reduced/increased/avoided compared to a standard serving

Use realistic Indian portions: 1 cup rice ≈ 200g, 1 chapati ≈ 40g, 1 katori dal ≈ 150ml, 1 katori curry ≈ 150g, 1 egg ≈ 50g, etc.

=== RETURN STRICT JSON (no markdown) ===
{
  "plates": [
    {
      "memberId": "exact id from above",
      "memberName": "name",
      "portions": [
        { "food": "Steamed rice", "grams": 150, "percentage": 35 },
        { "food": "Sambar", "grams": 180, "percentage": 25 }
      ],
      "calories": 624,
      "protein": 30,
      "carbs": 75,
      "fat": 22,
      "fiber": 8,
      "healthScore": 72,
      "suggestion": "Balance carbs with veggies",
      "warnings": [],
      "portionChanges": [
        { "action": "reduced", "items": ["Steamed rice"] },
        { "action": "increased", "items": ["Sambar", "Poriyal"] }
      ]
    }
  ],
  "mealSummary": "One line about the overall meal quality for this family"
}

The "percentage" in portions should add up to ~100 for each person's plate. It represents how much of their plate is that food item.

${
  body.language && body.language !== "en"
    ? `IMPORTANT: The "suggestion", "warnings", and "mealSummary" text MUST be in ${LANGUAGE_NAMES[body.language] ?? body.language}. Food names stay in English/original. JSON keys stay English.`
    : ""
}`;

    const result = await callOpenRouterJSON<FamilyMealAnalysis>({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 2500,
    });

    // Validate
    const plates = Array.isArray(result.plates)
      ? result.plates.map((p) => ({
          memberId: String(p.memberId ?? ""),
          memberName: String(p.memberName ?? ""),
          portions: Array.isArray(p.portions)
            ? p.portions.map((pt) => ({
                food: String(pt.food ?? ""),
                grams: Math.max(0, Math.round(Number(pt.grams) || 0)),
                percentage: Math.max(0, Math.round(Number(pt.percentage) || 0)),
              }))
            : [],
          calories: Math.max(0, Math.round(Number(p.calories) || 0)),
          protein: Math.max(0, Math.round(Number(p.protein) || 0)),
          carbs: Math.max(0, Math.round(Number(p.carbs) || 0)),
          fat: Math.max(0, Math.round(Number(p.fat) || 0)),
          fiber: Math.max(0, Math.round(Number(p.fiber) || 0)),
          healthScore: Math.min(100, Math.max(0, Math.round(Number(p.healthScore) || 0))),
          suggestion: String(p.suggestion ?? ""),
          warnings: Array.isArray(p.warnings) ? p.warnings.map(String) : [],
          portionChanges: Array.isArray(p.portionChanges)
            ? p.portionChanges.map((c) => ({
                action: String(c.action ?? "increased") as "reduced" | "increased" | "avoided" | "added",
                items: Array.isArray(c.items) ? c.items.map(String) : [],
              }))
            : [],
        }))
      : [];

    return NextResponse.json<FamilyMealAnalysis>({
      plates,
      mealSummary: String(result.mealSummary ?? ""),
    });
  } catch (err) {
    console.error("analyze-family-meal error", err);
    return NextResponse.json({ error: "Family meal analysis failed" }, { status: 500 });
  }
}
