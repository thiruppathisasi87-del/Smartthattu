import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatNumber(n: number, digits = 0): string {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "0";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ageGroup(age: number): string {
  if (age < 1) return "Infant";
  if (age < 4) return "Toddler";
  if (age < 13) return "Child";
  if (age < 18) return "Teenager";
  if (age < 60) return "Adult";
  return "Senior";
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
