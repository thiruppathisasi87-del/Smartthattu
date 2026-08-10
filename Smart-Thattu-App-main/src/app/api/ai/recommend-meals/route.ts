import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type { FamilyMember } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RequestBody {
  member: FamilyMember;
  mealType?: "breakfast" | "lunch" | "dinner" | "snacks" | "full_day" | "weekly";
  preferences?: string;
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

export interface MealSuggestion {
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  title: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rationale: string;
}

export interface MealRecommendation {
  suggestions: MealSuggestion[];
  overallGuidance: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    if (!body.member) {
      return NextResponse.json({ error: "Missing member" }, { status: 400 });
    }

    const mealType = body.mealType ?? "full_day";

    const userPrompt = `You are an expert Indian nutritionist. Generate personalised meal recommendations for the following family member. All suggestions should use familiar Indian recipes (regional variety welcome), use common Indian ingredients, be realistic to prepare, and respect their medical conditions, activity level, and goals. If the person has Diabetes, keep low GI and moderate carbs; Hypertension — low salt; Kidney disease — low sodium, low potassium, controlled protein; Pregnant — include iron, folate, calcium; Weight loss — calorie controlled, high protein/fiber; Weight gain — high calorie dense, healthy fats; Toddler/Child — kid-friendly, soft, finger-food friendly; Senior — easy to chew, low sodium, high protein.

=== MEMBER ===
Name: ${body.member.name}
Age: ${body.member.age}
Gender: ${body.member.gender}
Activity: ${body.member.activityLevel}
Health category: ${body.member.healthCategory}
Conditions: ${body.member.medicalConditions.join(", ") || "None"}
Goal: ${body.member.goal || "General health"}
Preferences: ${body.preferences || "None specified"}

=== MEAL REQUEST ===
Scope: ${mealType}
If "full_day": produce breakfast, lunch, evening snacks, dinner.
If "breakfast"/"lunch"/"dinner"/"snacks": produce 3 alternative suggestions for that meal.
If "weekly": produce 7 days, each containing breakfast, lunch, snacks, dinner.

=== RETURN STRICT JSON (NO markdown, NO commentary) ===
Match this structure exactly:
{
  "suggestions": [
    {
      "mealType": "breakfast|lunch|dinner|snacks",
      "title": "e.g. Moong Dal Chilla with Mint Chutney & Buttermilk",
      "items": ["main item", "side 1", "side 2", "drink (optional)"],
      "calories": number (per serving, total meal kcal),
      "protein": number (g),
      "carbs": number (g),
      "fat": number (g),
      "rationale": "one short sentence why this meal fits this person"
    }
  ],
  "overallGuidance": "2-4 sentence summary guidance for this person (water, cooking method, things to avoid, etc.)"
}

For weekly: provide 7 * 4 = 28 entries grouped under suggestions.
Use Indian household portions (1-2 chapatis, 1 cup rice, 1 katori dal, etc.). Provide realistic kcal for the full meal.

${
  body.language && body.language !== "en"
    ? `VERY IMPORTANT: All user-facing text in your JSON ("title", "items", "rationale", "overallGuidance") MUST be written entirely in ${LANGUAGE_NAMES[body.language] ?? body.language}, using the native script. Dish names may keep their standard Indian name if commonly used (e.g., "chapati", "dal", "idli") but prepend/translate with the common local name when appropriate. JSON keys remain in English. Numbers stay as numbers.`
    : ""
}`;

    const data = await callOpenRouterJSON<MealRecommendation>({
      messages: [
        {
          role: "system",
          content:
            "You are a senior Indian registered nutritionist. Output ONLY valid JSON with accurate nutrition numbers. No markdown, no prose outside JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      maxTokens: mealType === "weekly" ? 4000 : 1800,
    });

    return NextResponse.json<MealRecommendation>({
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      overallGuidance: data.overallGuidance ?? "",
    });
  } catch (err) {
    console.error("recommend-meals error", err);
    return NextResponse.json(
      { error: "Meal recommendation failed", suggestions: [], overallGuidance: "" },
      { status: 500 }
    );
  }
}
