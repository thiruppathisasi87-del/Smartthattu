"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Leaf,
  User as UserIcon,
  Loader2,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { Button, Card, PageHeader, Textarea } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const SUGGESTIONS = [
  "What should I cook today?",
  "Suggest a healthy dinner",
  "Low sodium Indian recipes",
  "Protein rich breakfast for my toddler",
  "Healthy diabetic lunch",
  "Give me a 7-day weekly meal plan",
];

export default function ChatPage() {
  const { family, meals, chat, addChatMessage, clearChat, settings } = useAppStore();
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, sending]);

  async function send(content?: string) {
    const text = (content ?? input).trim();
    if (!text || sending) return;
    setError(null);
    addChatMessage({ role: "user", content: text });
    setInput("");
    setSending(true);

    try {
      const messages: ChatMessage[] = [
        ...chat,
        { id: "local", role: "user", content: text, timestamp: new Date().toISOString() },
      ];
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          family,
          meals,
          model: settings.model,
          language: settings.language,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      if (!data.content) throw new Error("Empty response");
      addChatMessage({ role: "assistant", content: data.content });
    } catch (e) {
      setError("SmartThattu couldn't respond. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("chatEyebrow")}
        title={t("chatTitle")}
        subtitle={t("chatSubtitle")}
        action={
          chat.length > 0 && (
            <Button variant="ghost" onClick={() => confirm(t("clearChatConfirm")) && clearChat()}>
              <Trash2 className="w-4 h-4" /> {t("clearChat")}
            </Button>
          )
        }
      />

      <Card className="p-0 overflow-hidden flex flex-col h-[70vh] min-h-[500px]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--muted)]/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">{t("appName")}</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              {t("aiKnowsFamily")}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] text-[var(--muted-foreground)]">
              {sending ? t("thinking") : t("online")}
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]"
        >
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{t("namaste")}</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-sm mt-1">
                {t("namasteSub")}
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {chat.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-2.5 items-start",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                    m.role === "user"
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-sm"
                      : "bg-[var(--muted)] text-[var(--foreground)] rounded-tl-sm border border-[var(--border)]"
                  )}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sending && (
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span className="text-sm text-[var(--muted-foreground)]">
                  {t("cookingUp")}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs border-t border-red-500/20">
            {t("chatFailed")}
          </div>
        )}

        <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("typeMessage")}
              className="min-h-[44px] max-h-32 resize-none bg-[var(--card)]"
              rows={1}
            />
            <Button
              variant="accent"
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="h-[44px] w-[44px] !p-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1.5 text-center">
            {t("enterSend", { model: settings.model })}
          </p>
        </div>
      </Card>
    </div>
  );
}
