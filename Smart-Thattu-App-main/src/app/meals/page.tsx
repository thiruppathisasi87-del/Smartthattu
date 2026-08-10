"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  X,
  Trash2,
  Users as UsersIcon,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Ban,
  PlusCircle,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import { Autocomplete } from "@/components/Autocomplete";
import { INDIAN_FOODS, MEAL_TYPES } from "@/data/foods";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { MealFoodItem, MealType } from "@/types";
import { cn, todayISO } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PersonalizedPlate, FamilyMealAnalysis } from "@/app/api/ai/analyze-family-meal/route";

const PIE_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];

interface DraftFood {
  name: string;
  quantity: string;
}

export default function MealsPage() {
  const { family, settings } = useAppStore();
  const { t } = useI18n();

  const [mealType, setMealType] = useState<MealType>("lunch");
  const [drafts, setDrafts] = useState<DraftFood[]>([
    { name: "", quantity: "" },
    { name: "", quantity: "" },
    { name: "", quantity: "" },
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FamilyMealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: t("breakfast"),
    lunch: t("lunch"),
    dinner: t("dinner"),
    snacks: t("snacks"),
  };

  function addDraftRow() {
    setDrafts([...drafts, { name: "", quantity: "" }]);
  }
  function updateDraft(i: number, patch: Partial<DraftFood>) {
    setDrafts(drafts.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function removeDraft(i: number) {
    if (drafts.length <= 1) return;
    setDrafts(drafts.filter((_, idx) => idx !== i));
  }

  function resetMeal() {
    setResult(null);
    setError(null);
    setDrafts([
      { name: "", quantity: "" },
      { name: "", quantity: "" },
      { name: "", quantity: "" },
    ]);
  }

  async function analyzeMeal() {
    const foods: MealFoodItem[] = drafts
      .filter((d) => d.name.trim())
      .map((d) => ({
        name: d.name.trim(),
        quantity: d.quantity.trim() || "1 serving",
      }));
    if (!foods.length) return;
    if (!family.length) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/analyze-family-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foods,
          family,
          language: settings.language,
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = (await res.json()) as FamilyMealAnalysis;
      if (!data.plates?.length) throw new Error("No plates returned");
      setResult(data);
    } catch (e) {
      setError("Couldn't analyze the meal. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  const foodsEntered = drafts.some((d) => d.name.trim());

  // No family members
  if (!family.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={t("mealsEyebrow")}
          title={t("mealsTitle")}
          subtitle={t("noFamilyForMeals")}
        />
        <EmptyState
          icon={<UtensilsCrossed className="w-7 h-7" />}
          title={t("addFamilyFirst")}
          subtitle={t("addFamilyFirstSub")}
          action={
            <Link href="/family">
              <Button variant="accent">
                {t("goToFamily")} <ArrowRight className="w-4 h-4" />
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
        eyebrow={t("mealsEyebrow")}
        title="Today's Thattu"
        subtitle={`One meal, personalized into ${family.length} individual plates for your family.`}
        action={
          result && (
            <Button variant="ghost" onClick={resetMeal}>
              <RotateCcw className="w-4 h-4" /> Log another meal
            </Button>
          )
        }
      />

      {/* Show meal entry form when no result */}
      {!result && (
        <>
          {/* Meal type tabs */}
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setMealType(mt.id)}
                className={cn(
                  "relative rounded-2xl p-3 sm:p-4 text-left transition-all border",
                  mealType === mt.id
                    ? "border-transparent text-white shadow-lg"
                    : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--muted)]"
                )}
              >
                {mealType === mt.id && (
                  <div
                    className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br", mt.color)}
                    aria-hidden
                  />
                )}
                <div className="relative">
                  <div className="text-2xl">{mt.icon}</div>
                  <div className={cn("font-semibold text-sm sm:text-base mt-1", mealType === mt.id ? "text-white" : "")}>
                    {mealTypeLabels[mt.id]}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Food entry */}
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  What did the family cook for {mealTypeLabels[mealType]}?
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Add all dishes cooked — SmartThattu will split into personalized plates for {family.map((m) => m.name).join(", ")}.
                </p>
              </div>
              <Button variant="ghost" onClick={addDraftRow}>
                <Plus className="w-4 h-4" /> {t("addFood")}
              </Button>
            </div>

            {/* Column headers */}
            <div className="grid sm:grid-cols-[1fr,160px,40px] gap-2 items-end">
              <Label>{t("foodItem")}</Label>
              <Label className="hidden sm:block">{t("quantity")}</Label>
              <div />
            </div>

            {/* Food rows */}
            <div className="space-y-2">
              {drafts.map((d, i) => (
                <div
                  key={i}
                  className="grid sm:grid-cols-[1fr,160px,40px] gap-2 items-center"
                >
                  <Autocomplete
                    options={INDIAN_FOODS.map((f) => ({ name: f.name, aliases: f.aliases }))}
                    value={d.name ? [d.name] : []}
                    onChange={(val) => updateDraft(i, { name: val[0] ?? "" })}
                    placeholder={t("searchFoodPlaceholder")}
                    singleSelect
                    showPopularOnFocus
                  />
                  <Input
                    value={d.quantity}
                    onChange={(e) => updateDraft(i, { quantity: e.target.value })}
                    placeholder={t("quantityPlaceholder")}
                    className="h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraft(i)}
                    disabled={drafts.length <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-[var(--danger)] disabled:opacity-30"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick-add chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Steamed Rice", "Chapati", "Sambar", "Rasam", "Dal", "Curd", "Poriyal", "Chicken Curry", "Fish Curry", "Egg"].map(
                (food) => (
                  <button
                    key={food}
                    onClick={() => {
                      const emptyIdx = drafts.findIndex((d) => !d.name.trim());
                      if (emptyIdx >= 0) {
                        updateDraft(emptyIdx, { name: food });
                      } else {
                        setDrafts([...drafts, { name: food, quantity: "" }]);
                      }
                    }}
                    className="chip hover:bg-[var(--border)] transition-colors cursor-pointer"
                  >
                    + {food}
                  </button>
                )
              )}
            </div>

            {/* Family preview */}
            <div className="mt-4 rounded-xl bg-[var(--muted)] p-3 flex items-center gap-3">
              <UsersIcon className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <div className="text-sm">
                <span className="text-[var(--muted-foreground)]">Splitting for: </span>
                <span className="font-medium">
                  {family.map((m) => `${m.name} (${m.age}y, ${m.healthCategory})`).join(" · ")}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="accent"
                onClick={analyzeMeal}
                loading={analyzing}
                disabled={!foodsEntered}
              >
                <Sparkles className="w-4 h-4" /> Analyze & split plates
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Loading state */}
      {analyzing && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.map((m) => (
            <div key={m.id} className="card">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-44 w-44 mx-auto rounded-full mb-4" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-medium">Analysis failed</div>
            <div className="text-sm">{error}</div>
          </div>
          <Button variant="ghost" onClick={analyzeMeal} className="ml-auto">
            Retry
          </Button>
        </Card>
      )}

      {/* Results — personalized plates */}
      {result && !analyzing && (
        <>
          {result.mealSummary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-[#2a1a10] dark:to-[#1c1c1e] border-0"
            >
              <div className="flex items-start gap-3">
                <UtensilsCrossed className="w-5 h-5 text-[var(--accent)] mt-0.5" />
                <div>
                  <div className="font-semibold">Today&apos;s Thattu</div>
                  <p className="text-sm mt-1 text-[var(--foreground)]/90">
                    {result.mealSummary}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {result.plates.map((plate, idx) => (
                <PlateCard key={plate.memberId} plate={plate} index={idx} />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={resetMeal}>
              <RotateCcw className="w-4 h-4" /> Log another meal
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function PlateCard({ plate, index }: { plate: PersonalizedPlate; index: number }) {
  const pieData = plate.portions.map((p) => ({
    name: p.food,
    value: p.percentage,
    grams: p.grams,
  }));

  const actionIcons = {
    reduced: <TrendingDown className="w-3.5 h-3.5 text-amber-500" />,
    increased: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />,
    avoided: <Ban className="w-3.5 h-3.5 text-red-500" />,
    added: <PlusCircle className="w-3.5 h-3.5 text-blue-500" />,
  };

  const actionLabels = {
    reduced: "Reduced",
    increased: "Increased",
    avoided: "Avoided",
    added: "Added",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card"
    >
      {/* Name */}
      <h3 className="text-center font-semibold text-lg mb-3">{plate.memberName}</h3>

      {/* Pie chart */}
      <div className="h-48 w-48 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={0}
              outerRadius={80}
              dataKey="value"
              stroke="var(--card)"
              strokeWidth={2}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value, name, props) => {
                const grams = (props as { payload?: { grams?: number } })?.payload?.grams ?? 0;
                return [`${grams}g (${value as number}%)`, name as string];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 mb-4">
        {pieData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span>{item.name}</span>
            <span className="opacity-60">{item.grams}g</span>
          </div>
        ))}
      </div>

      {/* Macro boxes */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        <MacroBox label="KCAL" value={plate.calories} />
        <MacroBox label="CARBS" value={`${plate.carbs}g`} />
        <MacroBox label="PROTEIN" value={`${plate.protein}g`} />
        <MacroBox label="FAT" value={`${plate.fat}g`} />
      </div>

      {/* Suggestion */}
      {plate.suggestion && (
        <div className="rounded-xl bg-[var(--muted)] px-3 py-2 flex items-start gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
          <span className="text-xs">{plate.suggestion}</span>
        </div>
      )}

      {/* Warnings */}
      {plate.warnings.length > 0 && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
              {plate.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Portion changes */}
      {plate.portionChanges.length > 0 && (
        <div className="space-y-1">
          {plate.portionChanges.map((change, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              {actionIcons[change.action]}
              <span className="font-medium">{actionLabels[change.action]}:</span>
              <span>{change.items.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MacroBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-[var(--muted)] px-2 py-2 text-center">
      <div className="text-lg font-semibold tabular-nums leading-tight">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </div>
    </div>
  );
}
