"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Check,
  Sparkles,
  Download,
  Share2,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { GroceryList } from "@/types";

export default function GroceryPage() {
  const { meals, family } = useAppStore();
  const [mealPlan, setMealPlan] = useState("");
  const [familySize, setFamilySize] = useState(4);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<GroceryList | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState("");

  const last7Meals = useMemo(() => {
    return meals
      .slice(-20)
      .map((m) => {
        const name = family.find((f) => f.id === m.memberId)?.name ?? "Family";
        return `${m.mealType} for ${name}: ${m.foods.map((f) => f.name).join(", ")}`;
      })
      .join("\n");
  }, [meals, family]);

  async function generate() {
    setLoading(true);
    try {
      const body: { mealPlanText?: string; familySize: number } = {
        familySize,
      };
      const planText = mealPlan.trim() || last7Meals;
      if (planText) body.mealPlanText = planText;
      const res = await fetch("/api/ai/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setList({ categories: data.categories ?? [] });
      setChecked({});
    } finally {
      setLoading(false);
    }
  }

  function useRecentMeals() {
    setMealPlan(last7Meals);
  }

  function toggle(item: string) {
    setChecked((c) => ({ ...c, [item]: !c[item] }));
  }

  function downloadText() {
    if (!list) return;
    const lines: string[] = ["SmartThattu Grocery List", ""];
    list.categories.forEach((cat) => {
      lines.push(cat.category);
      cat.items.forEach((i) => lines.push(`  ☐ ${i}`));
      if (customItems.trim()) {
        lines.push("  ☐ " + customItems.trim());
      }
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartthatu-grocery-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalItems = list?.categories.reduce((acc, c) => acc + c.items.length, 0) ?? 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Grocery"
        title="Smart grocery list generator"
        subtitle="Paste your meal plan or pull from your logged meals — SmartThattu builds a categorized Indian grocery list."
      />

      <Card>
        <div className="grid md:grid-cols-[1fr,auto] gap-4 items-end">
          <div>
            <Label htmlFor="plan">
              Meal plan
              <span className="ml-1 font-normal opacity-70">
                (dishes or meals you plan to cook)
              </span>
            </Label>
            <Textarea
              id="plan"
              value={mealPlan}
              onChange={(e) => setMealPlan(e.target.value)}
              placeholder={`e.g.\nMon breakfast: moong dal chilla, mint chutney\nMon lunch: chapati, palak paneer, raita\nMon dinner: khichdi, curd\n...`}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fsize">Family size</Label>
            <Input
              id="fsize"
              type="number"
              min={1}
              max={20}
              value={familySize}
              onChange={(e) => setFamilySize(parseInt(e.target.value, 10) || 1)}
              className="w-24"
            />
            {meals.length > 0 && (
              <Button
                variant="ghost"
                onClick={useRecentMeals}
                className="w-full"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Use recent meals
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="accent"
            onClick={generate}
            loading={loading}
            disabled={!mealPlan.trim() && !last7Meals}
          >
            <Sparkles className="w-4 h-4" /> Generate grocery list
          </Button>
        </div>
      </Card>

      {!list && !loading && (
        <EmptyState
          icon={<ShoppingCart className="w-7 h-7" />}
          title="Your grocery list will appear here"
          subtitle="Enter a meal plan above or use your recent meals to generate one."
        />
      )}

      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              className="card"
            >
              <div className="skeleton h-5 w-1/3 rounded mb-3" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="skeleton h-4 w-full rounded" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {list && !loading && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Your grocery list</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {totalItems} items · {checkedCount} collected
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={downloadText}>
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "SmartThattu Grocery List",
                      text: list.categories
                        .map((c) => `${c.category}: ${c.items.join(", ")}`)
                        .join("\n"),
                    });
                  } else {
                    alert("Sharing not supported on this device.");
                  }
                }}
              >
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {list.categories.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{cat.category}</h4>
                  <span className="chip">
                    {cat.items.filter((it) => checked[it]).length}/{cat.items.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {cat.items.map((it) => {
                    const done = !!checked[it];
                    return (
                      <li key={it}>
                        <button
                          onClick={() => toggle(it)}
                          className="w-full flex items-center gap-2 text-left text-sm group"
                        >
                          <span
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                              done
                                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                                : "border-[var(--border)] group-hover:border-[var(--accent)]"
                            )}
                          >
                            {done && <Check className="w-3 h-3" />}
                          </span>
                          <span
                            className={cn(
                              "transition-all",
                              done && "line-through opacity-50"
                            )}
                          >
                            {it}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>

          <Card>
            <Label htmlFor="custom">Add custom items (one per line)</Label>
            <Textarea
              id="custom"
              value={customItems}
              onChange={(e) => setCustomItems(e.target.value)}
              rows={3}
              placeholder="e.g. Toothpaste, biscuits, chocolate..."
            />
            {customItems.trim() && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {customItems
                  .split("\n")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((c, i) => (
                    <span key={i} className="chip">
                      <Plus className="w-3 h-3" /> {c}
                    </span>
                  ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setList(null);
                setCustomItems("");
              }}
            >
              <Trash2 className="w-4 h-4" /> Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
