"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";
import type { Language } from "@/types";

type Dict = Record<string, string>;

// Import English as the canonical dictionary for keys; other dicts are typed
// loosely as `Dict` so that partial coverage is allowed (they fall back to English).
import { TRANSLATIONS as TRANSLATIONS_RAW } from "@/data/translations";
const TRANSLATIONS: Record<Language, Dict> = TRANSLATIONS_RAW as unknown as Record<Language, Dict>;
export type TranslationKey = keyof typeof import("@/data/translations").TRANSLATIONS.en;

interface I18nContextValue {
  lang: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useAppStore((s) => s.settings.language);

  const value = useMemo<I18nContextValue>(() => {
    const dict: Dict = TRANSLATIONS[lang] ?? TRANSLATIONS.en;
    const fallback: Dict = TRANSLATIONS.en;
    const t: I18nContextValue["t"] = (key, vars) => {
      const raw = (dict[key] ?? fallback[key] ?? key) as string;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_m: string, k: string) => String(vars[k] ?? `{${k}}`));
    };
    return { lang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback (if used outside provider during initial load)
    const fallback = TRANSLATIONS.en;
    return {
      lang: "en" as Language,
      t: (key: string, vars?: Record<string, string | number>) => {
        const raw = fallback[key] ?? key;
        if (!vars) return raw;
        return raw.replace(/\{(\w+)\}/g, (_m: string, k: string) => String(vars[k] ?? `{${k}}`));
      },
    };
  }
  return ctx;
}
