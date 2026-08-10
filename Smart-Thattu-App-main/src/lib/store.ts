"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  ChatMessage,
  FamilyMember,
  MealEntry,
  Theme,
} from "@/types";
import { uid } from "./utils";

interface AppState {
  family: FamilyMember[];
  meals: MealEntry[];
  chat: ChatMessage[];
  settings: AppSettings;
  selectedMemberId: string | null;
  supabaseEnabled: boolean;
  syncedAt: string | null;
  isAuthed: boolean;

  addMember: (m: Omit<FamilyMember, "id" | "createdAt">) => FamilyMember;
  updateMember: (id: string, patch: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  selectMember: (id: string | null) => void;

  addMeal: (m: Omit<MealEntry, "id">) => MealEntry;
  updateMeal: (id: string, patch: Partial<MealEntry>) => void;
  removeMeal: (id: string) => void;

  addChatMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
  clearChat: () => void;

  setTheme: (t: Theme) => void;
  setSettings: (s: Partial<AppSettings>) => void;
  reset: () => void;

  setAuthed: (a: boolean) => void;
  // Load data from Supabase, replacing in-memory state
  hydrateFromSupabase: () => Promise<void>;
  // Push current local state to Supabase
  syncToSupabase: () => Promise<{ ok: boolean; error?: string }>;
}

const DEFAULT_SETTINGS: AppSettings = {
  model: "openai/gpt-4.1-mini",
  language: "en",
  theme: "light",
};

const initialState = {
  family: [] as FamilyMember[],
  meals: [] as MealEntry[],
  chat: [] as ChatMessage[],
  settings: DEFAULT_SETTINGS,
  selectedMemberId: null as string | null,
  supabaseEnabled: false,
  syncedAt: null as string | null,
  isAuthed: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMember: (m) => {
        const member: FamilyMember = {
          ...m,
          id: uid("mem"),
          createdAt: new Date().toISOString(),
        };
        set({
          family: [...get().family, member],
          selectedMemberId: get().selectedMemberId ?? member.id,
        });
        queueSync();
        return member;
      },
      updateMember: (id, patch) => {
        set({
          family: get().family.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
        queueSync();
      },
      removeMember: (id) => {
        const family = get().family.filter((m) => m.id !== id);
        const meals = get().meals.filter((m) => m.memberId !== id);
        set({
          family,
          meals,
          selectedMemberId:
            get().selectedMemberId === id
              ? family[0]?.id ?? null
              : get().selectedMemberId,
        });
        queueSync();
      },
      selectMember: (id) => set({ selectedMemberId: id }),

      addMeal: (m) => {
        const entry: MealEntry = { ...m, id: uid("meal") };
        set({ meals: [...get().meals, entry] });
        queueSync();
        return entry;
      },
      updateMeal: (id, patch) => {
        set({
          meals: get().meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
        queueSync();
      },
      removeMeal: (id) => {
        set({ meals: get().meals.filter((m) => m.id !== id) });
        queueSync();
      },

      addChatMessage: (msg) => {
        const full: ChatMessage = {
          ...msg,
          id: uid("msg"),
          timestamp: new Date().toISOString(),
        };
        set({ chat: [...get().chat, full] });
        queueSync();
        return full;
      },
      clearChat: () => {
        set({ chat: [] });
        queueSync();
      },

      setTheme: (t) => {
        set({ settings: { ...get().settings, theme: t } });
        queueSync();
      },
      setSettings: (s) => {
        set({ settings: { ...get().settings, ...s } });
        queueSync();
      },
      reset: () => set({ ...initialState }),

      setAuthed: (a) => set({ isAuthed: a }),

      hydrateFromSupabase: async () => {
        try {
          const res = await fetch("/api/sync", { credentials: "include" });
          if (!res.ok) {
            set({ supabaseEnabled: false });
            return;
          }
          const data = await res.json();
          set({
            family: (data.family ?? []).map((r: Record<string, unknown>) => ({
              id: r.id,
              name: r.name,
              age: r.age,
              gender: r.gender,
              activityLevel: r.activity_level,
              healthCategory: r.health_category,
              medicalConditions: r.medical_conditions ?? [],
              goal: r.goal ?? undefined,
              createdAt: r.created_at,
            })) as FamilyMember[],
            meals: (data.meals ?? []).map((r: Record<string, unknown>) => ({
              id: r.id,
              memberId: r.member_id,
              mealType: r.meal_type,
              date: (r.date as string).slice(0, 10),
              foods: r.foods ?? [],
              analysis: r.analysis ?? undefined,
            })) as MealEntry[],
            chat: (data.chat ?? []).map((r: Record<string, unknown>) => ({
              id: r.id,
              role: r.role,
              content: r.content,
              timestamp: r.created_at,
            })) as ChatMessage[],
            settings: data.settings
              ? {
                  model: data.settings.model ?? DEFAULT_SETTINGS.model,
                  language: data.settings.language ?? DEFAULT_SETTINGS.language,
                  theme: data.settings.theme ?? DEFAULT_SETTINGS.theme,
                }
              : DEFAULT_SETTINGS,
            supabaseEnabled: true,
            isAuthed: true,
            selectedMemberId: get().selectedMemberId ?? (data.family?.[0]?.id ?? null),
            syncedAt: new Date().toISOString(),
          });
        } catch {
          set({ supabaseEnabled: false });
        }
      },

      syncToSupabase: async () => {
        const s = get();
        // Skip if not enabled (we optimistically mark enabled after first successful hydrate)
        if (!s.supabaseEnabled) return { ok: false, error: "not-enabled" };
        try {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              family: s.family,
              meals: s.meals,
              chat: s.chat,
              settings: s.settings,
            }),
          });
          if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
          set({ syncedAt: new Date().toISOString() });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: (e as Error).message };
        }
      },
    }),
    {
      name: "smartthatu-store",
      partialize: (state) => ({
        family: state.family,
        meals: state.meals,
        chat: state.chat,
        settings: state.settings,
        selectedMemberId: state.selectedMemberId,
      }),
    }
  )
);

// Debounced sync to avoid hammering Supabase on every keystroke
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function queueSync() {
  if (typeof window === "undefined") return;
  const enabled = useAppStore.getState().supabaseEnabled;
  if (!enabled) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    useAppStore.getState().syncToSupabase();
  }, 1200);
}
