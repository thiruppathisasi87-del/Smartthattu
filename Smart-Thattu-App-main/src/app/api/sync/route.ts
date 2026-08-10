/**
 * SmartThattu sync API.
 *
 * - GET  returns all data belonging to the authenticated user (family, meals, chat, settings).
 * - POST accepts a full state snapshot and upserts it into Supabase.
 *
 * If Supabase is not configured (missing env vars) the endpoint returns 503
 * and the client falls back to localStorage.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const [family, meals, chat, settingsRow] = await Promise.all([
    supabase.from("family_members").select("*").eq("user_id", user.user.id).order("created_at"),
    supabase.from("meals").select("*").eq("user_id", user.user.id).order("created_at"),
    supabase.from("chat_messages").select("*").eq("user_id", user.user.id).order("created_at"),
    supabase.from("user_settings").select("*").eq("user_id", user.user.id).maybeSingle(),
  ]);

  if (family.error || meals.error || chat.error || settingsRow.error) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }

  return NextResponse.json({
    family: family.data ?? [],
    meals: meals.data ?? [],
    chat: chat.data ?? [],
    settings: settingsRow.data,
  });
}

export async function POST(req: Request) {
  const supabase = await createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    family?: Array<Record<string, unknown>>;
    meals?: Array<Record<string, unknown>>;
    chat?: Array<Record<string, unknown>>;
    settings?: Record<string, unknown> | null;
  };

  const uid = user.user.id;
  // Clear existing rows for this user then bulk insert; simple but reliable for a personal app.
  // We run each operation independently so partial failures don't corrupt everything.
  if (body.family) {
    await supabase.from("family_members").delete().eq("user_id", uid);
    if (body.family.length > 0) {
      await supabase.from("family_members").insert(
        body.family.map((m) => ({
          ...mapKeys(m, {
            medicalConditions: "medical_conditions",
            healthCategory: "health_category",
            activityLevel: "activity_level",
            createdAt: "created_at",
          }),
          user_id: uid,
        }))
      );
    }
  }

  if (body.meals) {
    await supabase.from("meals").delete().eq("user_id", uid);
    if (body.meals.length > 0) {
      await supabase.from("meals").insert(
        body.meals.map((m) => ({
          ...mapKeys(m, {
            memberId: "member_id",
            mealType: "meal_type",
            createdAt: "created_at",
          }),
          user_id: uid,
        }))
      );
    }
  }

  if (body.chat) {
    await supabase.from("chat_messages").delete().eq("user_id", uid);
    if (body.chat.length > 0) {
      await supabase.from("chat_messages").insert(
        body.chat.map((c) => ({
          id: c.id,
          role: c.role,
          content: c.content,
          created_at: c.timestamp,
          user_id: uid,
        }))
      );
    }
  }

  if (body.settings) {
    const s = body.settings as Record<string, unknown>;
    await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: uid,
          model: s.model,
          language: s.language,
          theme: s.theme,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
  }

  return NextResponse.json({ ok: true });
}

/** Shallow key-rename helper for camelCase -> snake_case conversion. */
function mapKeys(obj: Record<string, unknown>, mapping: Record<string, string>) {
  const out: Record<string, unknown> = { ...obj };
  for (const [camel, snake] of Object.entries(mapping)) {
    if (camel in out) {
      out[snake] = out[camel];
      delete out[camel];
    }
  }
  return out;
}
