"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Users as UsersIcon,
  Sun,
  Moon,
  Coffee,
  Cookie,
  CalendarDays,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Select,
  Skeleton,
} from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { FamilyMember, MealType } from "@/types";

type Scope = MealType | "full_day" | "weekly";

const SCOPES: { value: Scope; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "snacks", label: "Snacks", icon: Cookie },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "full_day", label: "Full Day", icon: Sparkles },
  { value: "weekly", label: "Weekly Plan", icon: CalendarDays },
];

interface MealSuggestion {
  mealType: MealType;
  title: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rationale: string;
}

interface RecommendationResult {
  suggestions: MealSuggestion[];
  overallGuidance: string;
}

function RecommendPageInner() {
  const search = useSearchParams();
  const { family, selectedMemberId, selectMember } = useAppStore();

  const [scope, setScope] = useState<Scope>("full_day");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const member: FamilyMember | null = useMemo(() => {
    const qId = search.get("member");
    if (qId && family.find((f) => f.id === qId)) {
      return family.find((f) => f.id === qId) ?? null;
    }
    return family.find((f) => f.id === selectedMemberId) ?? family[0] ?? null;
  }, [family, selectedMemberId, search]);

  useEffect(() => {
    if (member) selectMember(member.id);
  }, [member, selectMember]);

  async function generate() {
    if (!member) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/recommend-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member,
          mealType: scope,
          preferences: preferences.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Couldn't generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Group weekly by day
  const isWeekly = scope === "weekly";
  const totalMeals = result?.suggestions.length ?? 0;
  const weeklyChunks = useMemo(() => {
    if (!isWeekly || !result) return [];
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.map((d, dayIdx) => ({
      day: d,
      meals: result.suggestions.slice(dayIdx * 4, dayIdx * 4 + 4),
    }));
  }, [isWeekly, result]);

  if (!family.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Recommend"
          title="Personalised meal recommendations"
        />
        <EmptyState
          icon={<Sparkles className="w-7 h-7" />}
          title="Add family members first"
          subtitle="We need to know about your family before we can recommend meals."
          action={
            <Link href="/family">
              <Button variant="accent">
                Go to family <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Meal Planner"
        title="SmartThattu recommends"
        subtitle="Let AI plan meals tailored to each family member's conditions, age and goals."
      />

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>For family member</Label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {family.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMember(m.id)}
                  className={cn(
                    "shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2",
                    member?.id === m.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                      : "bg-[var(--muted)] border-[var(--border)] hover:bg-[var(--border)]"
                  )}
                >
                  <UsersIcon className="w-3.5 h-3.5" />
                  {m.name}
                  <span className="text-[10px] opacity-70">
                    ({m.age})
                  </span>
                </button>
              ))}
            </div>
            {member && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip chip-accent">{member.healthCategory}</span>
                {member.medicalConditions.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
                {member.goal && <span className="chip">🎯 {member.goal}</span>}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="pref">Preferences (optional)</Label>
            <Input
              id="pref"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. no garlic, South Indian, quick under 30 min, high protein…"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Plan scope</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {SCOPES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  onClick={() => setScope(s.value)}
                  className={cn(
                    "rounded-2xl p-3 border text-center transition-all",
                    scope === s.value
                      ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white border-transparent shadow-lg"
                      : "bg-[var(--muted)] border-[var(--border)] hover:bg-[var(--border)]"
                  )}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs font-semibold">{s.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> AI uses {member?.name}&apos;s profile and conditions
          </div>
          <Button
            variant="accent"
            onClick={generate}
            loading={loading}
            disabled={!member}
          >
            <Sparkles className="w-4 h-4" />
            {result ? "Regenerate" : "Generate plan"}
            {result && <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="card bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6">
          {result.overallGuidance && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#2a1a10] dark:to-[#1c1c1e] border-0"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--accent)] mt-0.5" />
                <div>
                  <div className="font-semibold">Guidance for {member?.name}</div>
                  <p className="text-sm mt-1 text-[var(--foreground)]/90 leading-relaxed">
                    {result.overallGuidance}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isWeekly ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {weeklyChunks.map((d) => (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold">{d.day}</div>
                    <span className="chip">{d.meals.length} meals</span>
                  </div>
                  <div className="space-y-3">
                    {d.meals.map((m, i) => (
                      <MealBlock key={i} meal={m} compact />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {result.suggestions.map((m, i) => (
                <MealBlock key={i} meal={m} index={i} total={totalMeals} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealBlock({
  meal,
  compact,
  index,
  total: _total,
}: {
  meal: MealSuggestion;
  compact?: boolean;
  index?: number;
  total?: number;
}) {
  const meta = {
    breakfast: { icon: "🌅", label: "Breakfast", color: "from-amber-400 to-orange-500" },
    lunch: { icon: "☀️", label: "Lunch", color: "from-yellow-400 to-amber-500" },
    dinner: { icon: "🌙", label: "Dinner", color: "from-indigo-400 to-purple-500" },
    snacks: { icon: "🍪", label: "Snacks", color: "from-pink-400 to-rose-500" },
  }[meal.mealType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4",
        compact && "p-3"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center text-base bg-gradient-to-br text-white shadow-sm",
              meta.color
            )}
          >
            {meta.icon}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
              {meta.label}
            </div>
            <div className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>
              {meal.title}
            </div>
          </div>
        </div>
        {!compact && (
          <div className="text-right text-xs">
            <div className="font-semibold tabular-nums">{meal.calories}</div>
            <div className="text-[var(--muted-foreground)]">kcal</div>
          </div>
        )}
      </div>
      {meal.items?.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm text-[var(--muted-foreground)]">
          {meal.items.map((it, i) => (
            <li key={i} className="flex gap-1">
              <span className="text-[var(--accent)]">•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
      {!compact && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px]">
          <Pill label="P" value={`${meal.protein}g`} />
          <Pill label="C" value={`${meal.carbs}g`} />
          <Pill label="F" value={`${meal.fat}g`} />
        </div>
      )}
      {!compact && meal.rationale && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed italic">
          {meal.rationale}
        </p>
      )}
    </motion.div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--muted)] px-2 py-1 flex items-baseline gap-1">
      <span className="text-[10px] text-[var(--muted-foreground)]">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={null}>
      <RecommendPageInner />
    </Suspense>
  );
}
