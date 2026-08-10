"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Cpu,
  Trash2,
  Download,
  Upload,
  Shield,
  Info,
  Check,
} from "lucide-react";
import {
  Button,
  Card,
  Label,
  PageHeader,
  Select,
  Badge,
} from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Language, Theme } from "@/types";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { value: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { value: "te", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { value: "bn", label: "বাংলা (Bengali)", flag: "🇮🇳" },
  { value: "gu", label: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { value: "mr", label: "मराठी (Marathi)", flag: "🇮🇳" },
];

const MODELS = [
  { value: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini (default)", tag: "Fast & accurate" },
  { value: "openai/gpt-4.1", label: "GPT-4.1", tag: "Highest quality" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini", tag: "Balanced" },
  { value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku", tag: "Thoughtful" },
  { value: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)", tag: "Free, lower quality" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash 1.5", tag: "Fast" },
];

export default function SettingsPage() {
  const { settings, setSettings, family, meals, reset } = useAppStore();
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings({ [key]: value } as Partial<typeof settings>);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function exportData() {
    const data = { family, meals, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartthatu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.family || data.meals || data.settings) {
          // Use store persist directly via localStorage
          localStorage.setItem(
            "smartthatu-store",
            JSON.stringify({
              state: {
                family: data.family ?? [],
                meals: data.meals ?? [],
                chat: [],
                settings: data.settings ?? settings,
                selectedMemberId: null,
              },
              version: 0,
            })
          );
          alert("Imported! Refreshing...");
          location.reload();
        }
      } catch {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Preferences"
        subtitle="Control AI model, theme, language and your data."
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold">AI Model</h3>
          </div>
          <Label htmlFor="model">OpenRouter model</Label>
          <Select
            id="model"
            value={settings.model}
            onChange={(e) => update("model", e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} — {m.tag}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Info className="w-3 h-3" /> All AI calls go through SmartThattu's secure API. Your
            key never leaves the server.
          </p>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <Label>Theme</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["light", "dark"] as Theme[]).map((t) => {
              const active = settings.theme === t;
              return (
                <button
                  key={t}
                  onClick={() => update("theme", t)}
                  className={cn(
                    "rounded-2xl border p-3 flex items-center gap-3 transition-all text-left",
                    active
                      ? "border-[var(--accent)] bg-[var(--muted)] ring-2 ring-[var(--accent)]/20"
                      : "border-[var(--border)] hover:bg-[var(--muted)]"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      t === "light"
                        ? "bg-gradient-to-br from-amber-300 to-orange-400 text-white"
                        : "bg-gradient-to-br from-slate-800 to-black text-white"
                    )}
                  >
                    {t === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">{t}</div>
                    <div className="text-[11px] text-[var(--muted-foreground)]">
                      {t === "light" ? "Bright & clean" : "Easy on the eyes"}
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-[var(--accent)] ml-auto" />}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold">Language</h3>
            <Badge variant="warn" className="ml-2">
              Coming soon — UI strings English only
            </Badge>
          </div>
          <Label htmlFor="lang">AI response language</Label>
          <Select
            id="lang"
            value={settings.language}
            onChange={(e) => update("language", e.target.value as Language)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.flag} {l.label}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            SmartThattu will reply in your chosen language (meal names remain in their original form where appropriate).
          </p>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold">Your data</h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Your family profiles, meals and chat are stored locally on this device only. Nothing is sent to our servers except the AI requests needed to generate responses. You can export or delete everything at any time.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={exportData}>
              <Download className="w-4 h-4" /> Export data
            </Button>
            <label className="btn-ghost cursor-pointer">
              <Upload className="w-4 h-4" /> Import data
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importData}
              />
            </label>
            <Button
              variant="ghost"
              className="!text-red-600 hover:!bg-red-500/10"
              onClick={() => {
                if (confirm("Delete all family, meals and chat? This cannot be undone.")) {
                  reset();
                }
              }}
            >
              <Trash2 className="w-4 h-4" /> Reset everything
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-semibold">About SmartThattu</h3>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            SmartThattu is an AI-powered Indian family nutrition assistant. We use
            OpenRouter with GPT-4.1-mini (configurable) to power meal analysis,
            recommendations, grocery lists and chat. This tool is for
            informational purposes and does not replace a registered dietician or
            a doctor — especially for serious medical conditions.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="accent">Version 1.0.0</Badge>
            <Badge>Next.js 16</Badge>
            <Badge>OpenRouter</Badge>
            <Badge>Apple-inspired UI</Badge>
          </div>
        </Card>
      </motion.div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-full text-sm shadow-xl flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-green-400" /> Saved
        </motion.div>
      )}
    </div>
  );
}
