"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Loader2,
  Sparkles,
  Mail,
  Lock,
  UserPlus,
  Cloud,
  CloudOff,
} from "lucide-react";
import { supabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button, Input, Label } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function Auth() {
  const { t } = useI18n();
  const [user, setUser] = useState<{ email?: string } | null | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrate = useAppStore((s) => s.hydrateFromSupabase);
  const syncedAt = useAppStore((s) => s.syncedAt);
  const supabaseEnabled = useAppStore((s) => s.supabaseEnabled);
  const supabase = supabaseBrowserClient;

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ? { email: data.session.user.email } : null);
      if (data.session?.user) hydrate();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
      if (session?.user) hydrate();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, hydrate]);

  // No Supabase configured
  if (!supabase) {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]"
        title="Supabase not connected — using local storage"
      >
        <CloudOff className="w-3.5 h-3.5" />
        Local
      </span>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase!.auth.signInWithPassword({ email, password })
          : await supabase!.auth.signUp({ email, password });
      if (error) throw error;
      setOpen(false);
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      setError((err as Error).message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase!.auth.signOut();
    location.reload();
  }

  return (
    <>
      {user ? (
        <div className="hidden md:flex items-center gap-2">
          {syncedAt && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] text-[var(--muted-foreground)]"
              title={`Last synced ${new Date(syncedAt).toLocaleTimeString()}`}
            >
              <Cloud className="w-3 h-3 text-green-500" />
              {supabaseEnabled ? "Synced" : "Local"}
            </span>
          )}
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
            title="Sign out"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{user.email ?? "Account"}</span>
            <LogOut className="w-3 h-3 ml-1 opacity-70" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t("signIn")}
        </button>
      )}

      <AnimatePresence>
        {open && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm card p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">
                    {mode === "signin" ? t("welcomeBack") : t("createAccount")}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {t("syncSubtitle")}
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  loading={loading}
                >
                  {mode === "signin" ? (
                    <>
                      <User className="w-4 h-4" /> {t("signIn")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> {t("signUp")}
                    </>
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-3 w-full text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {mode === "signin" ? t("noAccount") : t("haveAccount")}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-lg"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { cn };
