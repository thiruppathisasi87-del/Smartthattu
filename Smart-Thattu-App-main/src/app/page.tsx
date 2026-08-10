"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  UtensilsCrossed,
  BarChart3,
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Globe,
  Heart,
  Leaf,
  Activity,
  Apple as AppleIcon,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Meal Planner",
    desc: "Personalised daily & weekly Indian meal plans for every family member.",
    color: "from-orange-500 to-rose-500",
  },
  {
    icon: Users,
    title: "Family Profiles",
    desc: "Add unlimited members with age, activity levels and health conditions.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Heart,
    title: "Health Recommendations",
    desc: "Smart suggestions tailored for diabetes, PCOS, pregnancy, hypertension and more.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Nutrition Analysis",
    desc: "Instantly log meals and see calories, protein, carbs, fat, and micronutrients.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShoppingCart,
    title: "Grocery Suggestions",
    desc: "Auto-generate categorized grocery lists from your weekly meal plan.",
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: Globe,
    title: "Indian Cuisine Support",
    desc: "From idli-dosa to rajma-chawal, biryani to dhokla — dishes from across India.",
    color: "from-indigo-500 to-purple-500",
  },
];

const CONDITIONS = [
  "Diabetes",
  "Hypertension",
  "PCOS",
  "Pregnancy",
  "Thyroid",
  "Kidney Disease",
  "Heart Disease",
  "Obesity",
  "Anemia",
  "Arthritis",
  "Acid Reflux",
  "Senior Citizen",
  "Toddler",
  "Sports Nutrition",
];

export default function LandingPage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-8">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-400/30 to-rose-500/30 blur-3xl" />
          <div className="absolute top-40 -right-24 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-300/20 to-pink-400/20 blur-3xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 chip chip-accent mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by GPT-4.1-mini
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
                <span className="gradient-text">SmartThattu</span>
              </h1>
              <p className="mt-4 text-lg sm:text-xl font-medium text-[var(--muted-foreground)]">
                AI-Powered Indian Family Nutrition Assistant
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--foreground)]/90 max-w-xl">
                Healthy, home-cooked Indian meals personalised for every member of
                your family — from your toddler to your grandparents. SmartThattu
                understands diabetes, hypertension, PCOS, pregnancy, weight goals
                and everything in between, and builds plans around the food you
                already love.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/family">
                  <Button variant="accent" className="text-base h-12 px-6">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" className="text-base h-12 px-6">
                    <MessageSquare className="w-4 h-4" />
                    Try Ask SmartThattu
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" /> No signup needed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" /> Family stays on device
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" /> Privacy-first
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative card p-6 shadow-xl bg-gradient-to-br from-white to-orange-50 dark:from-[#1c1c1e] dark:to-[#2a1a10] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Today for your family
                  </div>
                  <div className="text-lg font-semibold mt-0.5">
                    Monday Meal Plan
                  </div>
                </div>
                <div className="chip chip-accent">
                  <Leaf className="w-3.5 h-3.5" /> Balanced
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { time: "🌅 Breakfast", dish: "Moong Dal Chilla + Mint Chutney + Buttermilk", cal: 340 },
                  { time: "☀️ Lunch", dish: "Chapati + Palak Paneer + Cucumber Raita", cal: 560 },
                  { time: "🍪 Snacks", dish: "Roasted Makhana + 1 Apple + Masala Chai", cal: 180 },
                  { time: "🌙 Dinner", dish: "Khichdi + Kaddu Sabzi + Curd", cal: 480 },
                ].map((m, i) => (
                  <motion.div
                    key={m.time}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
                  >
                    <div className="text-2xl">{m.time.split(" ")[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {m.time.split(" ").slice(1).join(" ")}
                      </div>
                      <div className="font-medium text-sm truncate">
                        {m.dish}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--muted-foreground)]">
                        kcal
                      </div>
                      <div className="font-semibold tabular-nums text-sm">
                        {m.cal}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Protein", v: "78g" },
                  { l: "Fiber", v: "32g" },
                  { l: "Score", v: "92" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl bg-[var(--muted)] py-2"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                      {s.l}
                    </div>
                    <div className="font-semibold text-sm">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 card p-3 shadow-xl flex items-center gap-2 bg-[var(--card)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Safe for Diabetes
                </div>
                <div className="text-xs font-semibold">Low GI, high fiber</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-2 card p-3 shadow-xl flex items-center gap-2 bg-[var(--card)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Grandmother friendly
                </div>
                <div className="text-xs font-semibold">Low sodium</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="chip chip-accent mb-3 mx-auto">Features</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Everything your family needs to eat well
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Built for Indian kitchens, Indian ingredients and Indian families.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg mb-4`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Conditions */}
      <section className="card bg-gradient-to-br from-orange-50 to-rose-50 dark:from-[#1c1c1e] dark:to-[#2a1a10] border-0">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="chip chip-accent mb-3">
              <Activity className="w-3.5 h-3.5" /> Smart condition awareness
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Understands hundreds of health conditions
            </h2>
            <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
              SmartThattu automatically classifies medical conditions and
              tailors every meal to keep your family safe and healthy. From
              gestational diabetes to post-surgery recovery, from PCOS to
              toddler fussy-eating — it knows.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Low sodium", "Low GI", "High iron", "Soft diet", "High protein", "Low purine"].map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl bg-[var(--card)] border border-[var(--border)] px-3 py-2 text-sm font-medium flex items-center gap-2"
              >
                <AppleIcon className="w-4 h-4 text-[var(--accent)]" />
                {c}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="chip mb-3 mx-auto">How it works</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Three steps to healthier family meals
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "1",
              t: "Add your family",
              d: "Enter each member's age, gender, activity level and health conditions.",
              icon: Users,
            },
            {
              n: "2",
              t: "Log or plan meals",
              d: "Log what you eat with Indian food autocomplete, or let AI generate a plan.",
              icon: UtensilsCrossed,
            },
            {
              n: "3",
              t: "Cook, eat, track",
              d: "See nutrition scores, build grocery lists, and chat with SmartThattu anytime.",
              icon: BarChart3,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="card relative">
                <div className="absolute top-4 right-4 text-5xl font-bold text-[var(--muted)] dark:text-white/5 leading-none">
                  {s.n}
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold relative">{s.t}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {s.d}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonial */}
      <section className="card bg-gradient-to-br from-[var(--muted)] to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4 text-amber-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-lg sm:text-xl leading-relaxed">
            “SmartThattu plans meals for my diabetic father-in-law, my pregnant
            sister, my toddler and my gym-going husband — all at once. It
            actually understands Indian food. It's been a game changer.”
          </p>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            — Priya R., Chennai
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="card p-10 sm:p-14 bg-gradient-to-br from-orange-500 to-rose-500 text-white text-center border-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Ready to cook healthier for your family?
          </h2>
          <p className="mt-3 opacity-90 max-w-xl mx-auto">
            Set up your first family member in under a minute. SmartThattu takes
            care of the rest.
          </p>
          <div className="mt-7">
            <Link href="/family">
              <button className="bg-white text-orange-600 font-semibold px-7 py-3.5 rounded-full hover:shadow-2xl transition-all inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
