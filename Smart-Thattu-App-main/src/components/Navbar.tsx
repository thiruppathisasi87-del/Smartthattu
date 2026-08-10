"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  UtensilsCrossed,
  Sparkles,
  ShoppingCart,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Auth } from "./Auth";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const NAV_ITEMS = [
    { href: "/", label: t("navHome"), icon: Home },
    { href: "/family", label: t("navFamily"), icon: Users },
    { href: "/meals", label: t("navMeals"), icon: UtensilsCrossed },
    { href: "/recommend", label: t("navRecommend"), icon: Sparkles },
    { href: "/chat", label: t("navChat"), icon: Leaf },
    { href: "/grocery", label: t("navGrocery"), icon: ShoppingCart },
    { href: "/dashboard", label: t("navDashboard"), icon: BarChart3 },
    { href: "/settings", label: t("navSettings"), icon: SettingsIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 apple-glass border-b border-[var(--border)]">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white text-lg">🍲</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">{t("appName")}</span>
              <span className="text-[10px] text-[var(--muted-foreground)] -mt-0.5 hidden sm:block">
                {t("appTagline")}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    active
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-[var(--muted)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative w-4 h-4" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
            <Auth />
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-full hover:bg-[var(--muted)]"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed inset-x-0 top-16 z-40 apple-glass border-b border-[var(--border)] p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
}
