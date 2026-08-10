import { NextResponse } from "next/server";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type { HealthCategory } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface RequestBody {
  conditions: string[];
  age?: number;
  gender?: string;
}

interface Result {
  category: HealthCategory;
  reason: string;
}

const VALID_CATEGORIES: HealthCategory[] = [
  "Healthy",
  "Diabetes",
  "Cardiovascular",
  "Kidney",
  "Liver",
  "Digestive",
  "Thyroid",
  "Respiratory",
  "Cancer",
  "Autoimmune",
  "Bone & Joint",
  "Neurological",
  "Mental Health",
  "Women's Health",
  "Pregnancy & Postpartum",
  "Childhood & Growth",
  "Elderly Care",
  "Allergies & Intolerances",
  "Weight Management",
  "Infectious Disease",
  "Post-Surgery Recovery",
  "Sports Nutrition",
  "Other",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const conditions = (body.conditions ?? []).filter(Boolean);

    if (!conditions.length) {
      return NextResponse.json<Result>({
        category: "Healthy",
        reason: "No medical conditions specified.",
      });
    }

    const prompt = `You are a clinical-nutrition classifier for an Indian nutrition assistant. Given the list of medical conditions and demographics, assign the MOST relevant primary health category from the list provided. Return a short reason (1 sentence).

VALID CATEGORIES (must pick one):
${VALID_CATEGORIES.map((c) => `- ${c}`).join("\n")}

DETAILS:
- Age: ${body.age ?? "unknown"}
- Gender: ${body.gender ?? "unknown"}
- Medical conditions: ${conditions.join(", ")}

Return ONLY strict JSON with shape: { "category": string, "reason": string }`;

    const result = await callOpenRouterJSON<Result>({
      messages: [
        { role: "system", content: "You classify health categories. Output ONLY JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      maxTokens: 200,
    });

    // Guardrail: ensure category is valid
    const category = (VALID_CATEGORIES as string[]).includes(result.category)
      ? (result.category as HealthCategory)
      : "Other";

    return NextResponse.json<Result>({
      category,
      reason: result.reason ?? "",
    });
  } catch (err) {
    console.error("health-category error", err);
    return NextResponse.json<Result>(
      {
        category: "Healthy",
        reason: "Fallback: unable to fetch AI classification. Defaulting to Healthy.",
      },
      { status: 200 }
    );
  }
}
