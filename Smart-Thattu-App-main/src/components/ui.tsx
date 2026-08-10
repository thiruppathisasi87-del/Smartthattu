"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Card({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-enter">
      {eyebrow && (
        <div className="chip chip-accent mb-3">{eyebrow}</div>
      )}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[var(--muted-foreground)] mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  loading,
  disabled,
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "accent" | "ghost" | "outline";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium text-sm transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none";
  const sizes = "px-4 py-2.5";
  const variants: Record<string, string> = {
    primary: "btn-primary",
    accent: "btn-accent",
    ghost: "btn-ghost",
    outline:
      "border border-[var(--border)] bg-transparent text-[var(--foreground)] px-4 py-2.5 hover:bg-[var(--muted)]",
  };
  return (
    <button
      className={cn(base, sizes, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input-field", className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "input-field appearance-none bg-[var(--muted)] cursor-pointer pr-8",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("input-field resize-y min-h-[80px]", className)} {...rest} />;
}

export function Label({
  children,
  htmlFor,
  hint,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-xs font-medium text-[var(--muted-foreground)] mb-1.5", className)}
    >
      {children}
      {hint && <span className="ml-1 text-[11px] opacity-70">({hint})</span>}
    </label>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      aria-hidden
    />
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = "from-orange-500 to-rose-500",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
    >
      <div
        className={cn(
          "absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl",
          color
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {value}
            {unit && (
              <span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">
                {unit}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white",
              color
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card text-center py-12">
      {icon && (
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-500/20 dark:to-rose-500/20 flex items-center justify-center text-[var(--accent)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && (
        <p className="text-[var(--muted-foreground)] mt-2 max-w-md mx-auto text-sm">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warn" | "danger" | "accent";
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]",
    success:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    accent: "chip-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function HealthScoreRing({ score }: { score: number }) {
  const size = 72;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 80
      ? "#34c759"
      : score >= 60
      ? "#ff9500"
      : score >= 40
      ? "#ff9500"
      : "#ff3b30";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums">{score}</span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
          Score
        </span>
      </div>
    </div>
  );
}
