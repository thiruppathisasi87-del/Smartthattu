import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { SyncProvider } from "@/components/SyncProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartthatu.app"),
  title: "SmartThattu — AI Indian Family Nutrition Assistant",
  description:
    "SmartThattu is an AI-powered Indian family nutrition assistant that recommends healthy Indian meals based on age, health conditions, activity level, and dietary needs.",
  applicationName: "SmartThattu",
  appleWebApp: { capable: true, title: "SmartThattu", statusBarStyle: "default" },
  manifest: "/manifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "SmartThattu — AI Indian Family Nutrition Assistant",
    description:
      "Personalised Indian meal plans, nutrition analysis, grocery lists, and AI chat for every family member.",
    type: "website",
    images: [{ url: "/icon.svg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartThattu — AI Indian Family Nutrition Assistant",
    description:
      "Personalised Indian meal plans, nutrition analysis, grocery lists, and AI chat for every family member.",
    images: ["/icon.svg"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#ff6b35",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <I18nProvider>
            <SyncProvider>
              <Navbar />
              <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
                {children}
              </main>
              <Footer />
            </SyncProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 sm:px-6 py-10 text-center text-xs text-[var(--muted-foreground)]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-lg">🍲</span>
        <span className="font-medium text-[var(--foreground)]">SmartThattu</span>
      </div>
      <p>
        AI-powered Indian family nutrition. Always consult a qualified
        dietician or doctor for medical conditions.
      </p>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs opacity-70">
        <Link href="/setup" className="underline hover:opacity-100">
          Setup / Deploy guide
        </Link>
        <span>·</span>
        <span>Installable as a PWA</span>
      </div>
      <p className="mt-2 opacity-60">© {new Date().getFullYear()} SmartThattu</p>
    </footer>
  );
}
