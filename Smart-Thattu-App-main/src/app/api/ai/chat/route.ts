import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import type { ChatMessage, FamilyMember, MealEntry } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RequestBody {
  messages: ChatMessage[];
  family: FamilyMember[];
  meals: MealEntry[];
  model?: string;
  language?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const incoming = body.messages ?? [];
    if (!incoming.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(body.family ?? [], body.meals ?? []);

    const lang = body.language ?? "en";
    const languageInstruction =
      lang === "en"
        ? ""
        : `\n\nIMPORTANT: You MUST reply in the following language and script only (do NOT use English words unless they are well-known food/medical terms): ${lang}. The entire assistant message after this instruction must be in that language.`;

    const apiMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt + languageInstruction },
      ...incoming.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const content = await callOpenRouter({
      model: body.model,
      messages: apiMessages,
      temperature: 0.5,
      maxTokens: 1200,
    });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Chat failed", content: "" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(family: FamilyMember[], meals: MealEntry[]): string {
  const recentMeals = meals
    .slice(-30)
    .map((m) => {
      const name = family.find((f) => f.id === m.memberId)?.name ?? "Unknown";
      return `- ${m.date} · ${name} · ${m.mealType}: ${m.foods
        .map((f) => f.name)
        .join(", ")}${
        m.analysis
          ? ` (${m.analysis.nutrition.calories} kcal, score ${m.analysis.healthScore}/100)`
          : ""
      }`;
    })
    .join("\n");

  const familySummary = family
    .map((f) => {
      return `- ${f.name}, ${f.age}yo ${f.gender}, activity: ${f.activityLevel}, category: ${f.healthCategory}, conditions: ${f.medicalConditions.join(", ") || "none"}${f.goal ? `, goal: ${f.goal}` : ""}`;
    })
    .join("\n");

  return `You are SmartThattu — a warm, helpful AI nutrition assistant specialising in Indian family nutrition and home-cooked Indian food. You give practical, culturally-appropriate, evidence-based guidance. You know the family and their meal history. Use simple, friendly language. You may use bullet points and emojis sparingly. When suggesting recipes, prefer common Indian dishes from across the country (e.g. idli, dosa, upma, poha, khichdi, dal-rice, roti-sabzi, sambar-rice, curd-rice, cheela, thepla, chettinad, bengali fish curry, etc.). Always tailor advice to medical conditions (e.g. low sodium for hypertension, low GI for diabetes, low potassium for CKD, iron/folate for pregnancy, easily digestible for elderly/toddlers, high protein for muscle gain). If you don't know something, say so. Keep responses concise but useful.

=== CURRENT FAMILY (${family.length} members) ===
${familySummary || "(no family members added yet)"}

=== RECENT MEALS (last ${Math.min(meals.length, 30)}) ===
${recentMeals || "(no meals logged yet)"}

Today's date: ${new Date().toISOString().slice(0, 10)}.`;
}
