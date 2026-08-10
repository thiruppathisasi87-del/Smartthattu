import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type {
  FamilyMember,
  MealAnalysis,
  MealFoodItem,
  MealType,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 45;

interface RequestBody {
  mealType: MealType;
  foods: MealFoodItem[];
  member: FamilyMember;
  language?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी, Devanagari script)",
  ta: "Tamil (தமிழ், Tamil script)",
  te: "Telugu (తెలుగు, Telugu script)",
  bn: "Bengali (বাংলা, Bengali script)",
  gu: "Gujarati (ગુજરાતી, Gujarati script)",
  mr: "Marathi (मराठी, Devanagari script)",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    if (!body.foods?.length) {
      return NextResponse.json({ error: "No foods provided" }, { status: 400 });
    }
    if (!body.member) {
      return NextResponse.json({ error: "Missing member" }, { status: 400 });
    }

    const systemPrompt = `You are an expert Indian nutritionist working for SmartThattu, an Indian family nutrition assistant. Analyse an Indian meal for a specific family member and return STRICT JSON.`;

    const userPrompt = `Analyse the following ${body.mealType} for the person described. Consider Indian preparation styles, ghee/oil, portion sizes, and accompaniments (chutney, sambar, pickle, curd, rice, roti, etc.).

=== FAMILY MEMBER ===
Name: ${body.member.name}
Age: ${body.member.age}
Gender: ${body.member.gender}
Activity level: ${body.member.activityLevel}
Health category: ${body.member.healthCategory}
Medical conditions: ${body.member.medicalConditions.join(", ") || "None"}
${body.member.goal ? `Goal: ${body.member.goal}` : ""}

=== MEAL (${body.mealType.toUpperCase()}) ===
${body.foods
  .map((f, i) => `${i + 1}. ${f.name}${f.quantity ? ` — ${f.quantity}` : ""}`)
  .join("\n")}

=== RETURN STRICT JSON ===
{
  "nutrition": {
    "calories": number (total kcal),
    "protein": number (grams, total),
    "carbs": number (grams, total),
    "fat": number (grams, total),
    "fiber": number (grams, total),
    "micronutrients": string[] (3-8 key vitamins/minerals present, e.g. ["Iron", "Calcium", "Vitamin C", "Folate", "Magnesium"])
  },
  "healthScore": number (0 to 100, overall healthfulness tailored to this person's conditions),
  "suggestions": string[] (3-6 actionable, specific, Indian-cuisine appropriate tips to improve this meal for this person),
  "warnings": string[] (only if medical conditions are affected — e.g. high sodium for hypertension, high glycemic for diabetes, etc.; otherwise empty array)
}

Be accurate with Indian food nutrition numbers. 1 medium chapati ≈ 80 kcal, 1 cup cooked rice ≈ 200 kcal, 1 tablespoon ghee ≈ 112 kcal. Suggestions should reference alternatives in Indian cooking where possible (e.g., "replace white rice with brown rice or quinoa", "add a bowl of curd", "use less oil", "add a side salad", "pair with buttermilk instead of soda").

${
  body.language && body.language !== "en"
    ? `VERY IMPORTANT: All the "suggestions" and "warnings" text in your JSON response MUST be written in ${LANGUAGE_NAMES[body.language] ?? body.language} (using the native script). Nutrient field names (calories, protein, etc.) and micronutrient names should remain in English. Numbers stay as numbers. JSON keys stay in English. Do NOT wrap the JSON in markdown.`
    : ""
}`;

    const result = await callOpenRouterJSON<MealAnalysis>({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Validate & clamp
    const n = result.nutrition ?? ({} as MealAnalysis["nutrition"]);
    const safeAnalysis: MealAnalysis = {
      nutrition: {
        calories: Math.max(0, Math.round(Number(n.calories) || 0)),
        protein: Math.max(0, Math.round(Number(n.protein) || 0)),
        carbs: Math.max(0, Math.round(Number(n.carbs) || 0)),
        fat: Math.max(0, Math.round(Number(n.fat) || 0)),
        fiber: Math.max(0, Math.round(Number(n.fiber) || 0)),
        micronutrients: Array.isArray(n.micronutrients) ? n.micronutrients.slice(0, 10) : [],
      },
      healthScore: Math.min(100, Math.max(0, Math.round(Number(result.healthScore) || 0))),
      suggestions: Array.isArray(result.suggestions)
        ? result.suggestions.slice(0, 10)
        : [],
      warnings: Array.isArray(result.warnings) ? result.warnings.slice(0, 10) : [],
    };

    return NextResponse.json(safeAnalysis);
  } catch (err) {
    console.error("analyze-meal error", err);
    return NextResponse.json(
      { error: "Meal analysis failed" },
      { status: 500 }
    );
  }
}
