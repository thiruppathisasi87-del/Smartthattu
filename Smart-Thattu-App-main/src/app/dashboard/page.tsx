"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users as UsersIcon,
  UtensilsCrossed,
  Droplet,
} from "lucide-react";
import {
  Card,
  EmptyState,
  PageHeader,
  Select,
  StatCard,
} from "@/components/ui";
import { useAppStore } from "@/lib/store";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { todayISO } from "@/lib/utils";
import type { MealEntry } from "@/types";

const COLORS = ["#ff6b35", "#34c759", "#ffcc00", "#5ac8fa", "#af52de", "#ff3b30"];

type Range = "week" | "month";

export default function DashboardPage() {
  const { family, meals, selectMember, selectedMemberId } = useAppStore();
  const [range, setRange] = useState<Range>("week");
  const [memberFilter, setMemberFilter] = useState<string>(
    selectedMemberId ?? "all"
  );

  const filteredMeals = useMemo(() => {
    const days = range === "week" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return meals.filter(
      (m) =>
        m.date >= cutoffStr &&
        (memberFilter === "all" || m.memberId === memberFilter)
    );
  }, [meals, range, memberFilter]);

  // Water (assume default target 2.5L; tracked via logged items? Use synthetic target for UI)
  const totals = useMemo(() => {
    let c = 0,
      p = 0,
      cb = 0,
      f = 0,
      fib = 0;
    filteredMeals.forEach((m) => {
      if (!m.analysis) return;
      c += m.analysis.nutrition.calories;
      p += m.analysis.nutrition.protein;
      cb += m.analysis.nutrition.carbs;
      f += m.analysis.nutrition.fat;
      fib += m.analysis.nutrition.fiber;
    });
    return { calories: c, protein: p, carbs: cb, fat: f, fiber: fib };
  }, [filteredMeals]);

  const byDay = useMemo(() => {
    const days = range === "week" ? 7 : 30;
    const arr: Array<{ date: string; label: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; water: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayMeals = filteredMeals.filter((m) => m.date === key);
      let c = 0,
        p = 0,
        cb = 0,
        f = 0,
        fib = 0;
      dayMeals.forEach((m) => {
        if (!m.analysis) return;
        c += m.analysis.nutrition.calories;
        p += m.analysis.nutrition.protein;
        cb += m.analysis.nutrition.carbs;
        f += m.analysis.nutrition.fat;
        fib += m.analysis.nutrition.fiber;
      });
      arr.push({
        date: key,
        label: range === "week"
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.getDate().toString(),
        calories: Math.round(c),
        protein: Math.round(p),
        carbs: Math.round(cb),
        fat: Math.round(f),
        fiber: Math.round(fib),
        water: 2000 + Math.round(Math.random() * 600), // visual placeholder
      });
    }
    return arr;
  }, [filteredMeals, range]);

  const macroPie = useMemo(() => {
    // calories from macros: protein 4, carbs 4, fat 9
    const p = totals.protein * 4;
    const c = totals.carbs * 4;
    const f = totals.fat * 9;
    const total = p + c + f;
    if (!total) return [];
    return [
      { name: "Protein", value: Math.round((p / total) * 100) },
      { name: "Carbs", value: Math.round((c / total) * 100) },
      { name: "Fat", value: Math.round((f / total) * 100) },
    ];
  }, [totals]);

  const avgScore = useMemo(() => {
    const withScore = filteredMeals.filter(
      (m): m is MealEntry & { analysis: NonNullable<MealEntry["analysis"]> } =>
        !!m.analysis
    );
    if (!withScore.length) return 0;
    return Math.round(
      withScore.reduce((acc, m) => acc + m.analysis.healthScore, 0) /
        withScore.length
    );
  }, [filteredMeals]);

  const mealByType = useMemo(() => {
    const counts: Record<string, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
    };
    filteredMeals.forEach((m) => {
      counts[m.mealType] = (counts[m.mealType] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredMeals]);

  if (!family.length) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Dashboard" title="Nutrition Dashboard" />
        <EmptyState
          icon={<BarChart3 className="w-7 h-7" />}
          title="No data yet"
          subtitle="Add family members and log meals to see trends."
          action={
            <Link href="/family" className="btn-accent inline-flex">
              Get started
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Nutrition trends"
        subtitle="Track calories, macros and meal patterns across your family over time."
        action={
          <div className="flex items-center gap-2">
            <Select
              value={memberFilter}
              onChange={(e) => {
                setMemberFilter(e.target.value);
                if (e.target.value !== "all") selectMember(e.target.value);
              }}
              className="!w-auto"
            >
              <option value="all">All members</option>
              {family.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="!w-auto"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </Select>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total calories"
          value={Math.round(totals.calories).toLocaleString("en-IN")}
          unit="kcal"
          color="from-orange-500 to-rose-500"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Avg health score"
          value={avgScore}
          unit="/ 100"
          color="from-emerald-500 to-teal-500"
          icon={<UtensilsCrossed className="w-5 h-5" />}
        />
        <StatCard
          label="Meals logged"
          value={filteredMeals.length}
          color="from-indigo-500 to-purple-500"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          label="Family members"
          value={memberFilter === "all" ? family.length : 1}
          color="from-pink-500 to-rose-500"
          icon={<UsersIcon className="w-5 h-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calories trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Calories trend</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Daily total over the {range === "week" ? "last week" : "last month"}
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay}>
                <defs>
                  <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "var(--border)" }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#ff6b35"
                  strokeWidth={2.5}
                  fill="url(#cal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Macros distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
          <h3 className="font-semibold">Macro split</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            % of calories from macros
          </p>
          {macroPie.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
              Log meals to see macros
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroPie}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {macroPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => `${v as number}%`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Macros bars */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h3 className="font-semibold mb-1">Daily macros (g)</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">Protein, carbs, fat & fiber</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Bar dataKey="protein" name="Protein" fill="#34c759" radius={[6, 6, 0, 0]} />
                <Bar dataKey="carbs" name="Carbs" fill="#ffcc00" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fat" name="Fat" fill="#ff3b30" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Meal type distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h3 className="font-semibold mb-1">Meals by type</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Breakfast, lunch, dinner, snacks
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {mealByType.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        ["#ffcc00", "#ff9500", "#af52de", "#ff3b30"][i % 4]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Today's target callout */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-[#0f2a22] dark:to-[#0a1f1a] border-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold">Hydration & daily goals</h4>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Today is {todayISO()}. Aim for 8 glasses of water (≈ 2L), 5 servings
              of vegetables, 2 fruits, and 30 min of movement. Log your meals to
              see progress.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
