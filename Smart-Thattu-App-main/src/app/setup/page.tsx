"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Database,
  CheckCircle2,
  Cloud,
  CloudOff,
  Smartphone,
  GitBranch,
  Copy,
  KeyRound,
  LayoutTemplate,
  Play,
  Server,
  Rocket,
} from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { supabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SetupPage() {
  const isAuthed = useAppStore((s) => s.isAuthed);
  const [copied, setCopied] = useState<string | null>(null);
  const hasSupabase = !!supabaseBrowserClient;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const sqlBlock = `-- Run this in your Supabase SQL Editor
-- (full version at supabase/migrations/001_init.sql)
create extension if not exists pgcrypto;

create table family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  age int not null,
  gender text default 'other',
  activity_level text default 'moderate',
  health_category text default 'Healthy',
  medical_conditions jsonb default '[]',
  goal text,
  created_at timestamptz default now()
);
-- Then enable RLS (see migration file).`;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Setup & Deployment"
        title="Build & connect SmartThattu"
        subtitle="Follow these steps to run SmartThattu locally, connect Supabase, build the app, and install it as a PWA on your phone."
        action={
          <Link href="/">
            <Button variant="ghost">← Back to app</Button>
          </Link>
        }
      />

      {/* Status cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card
          className={cn(
            "flex items-center gap-3",
            hasSupabase
              ? "bg-green-500/10 border-green-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white",
              hasSupabase ? "bg-green-500" : "bg-amber-500"
            )}
          >
            {hasSupabase ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Supabase connection
            </div>
            <div className="font-semibold">
              {hasSupabase ? "Configured" : "Not configured (local only)"}
            </div>
          </div>
        </Card>
        <Card
          className={cn(
            "flex items-center gap-3",
            isAuthed
              ? "bg-green-500/10 border-green-500/30"
              : "bg-[var(--card)]"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white",
              isAuthed ? "bg-green-500" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            )}
          >
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Authentication
            </div>
            <div className="font-semibold">
              {isAuthed ? "Signed in & syncing" : "Not signed in"}
            </div>
          </div>
        </Card>
      </div>

      {/* Step 1 - Prereqs */}
      <Section index={1} icon={<Server />} title="Prerequisites">
        <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
          <li>Node.js 18+ (LTS recommended) and npm installed.</li>
          <li>A Supabase account (free tier works): <a className="underline text-[var(--accent)]" href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a></li>
          <li>An OpenRouter API key: <a className="underline text-[var(--accent)]" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys</a></li>
          <li>(Optional) A Vercel account for deploying to the web: <a className="underline text-[var(--accent)]" href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a></li>
        </ul>
      </Section>

      {/* Step 2 - Clone + install */}
      <Section index={2} icon={<GitBranch />} title="Get the source and install dependencies">
        <CodeBlock language="bash" code={
`# Clone the repo (or download the project)
git clone <your-repo-url> smartthatu
cd smartthatu

# Install dependencies
npm install`}
          onCopy={(c) => copy(c, "install")}
          copied={copied === "install"}
        />
      </Section>

      {/* Step 3 - Supabase project */}
      <Section index={3} icon={<Database />} title="Create your Supabase project">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>Go to <a className="underline text-[var(--accent)]" href="https://app.supabase.com" target="_blank" rel="noreferrer">app.supabase.com</a> → <b>New project</b>. Give it a name, pick a region near you, set a strong DB password.</li>
          <li>Wait for the project to finish initialising (usually ~1 minute).</li>
          <li>In the left sidebar, open <b>SQL Editor</b>.</li>
          <li>Click <b>New query</b>, paste the contents of <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">supabase/migrations/001_init.sql</code> (see the <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">supabase/</code> folder in your project), then click <b>Run</b>.
            <p className="mt-1 text-xs">This creates 5 tables (<code>family_members</code>, <code>meals</code>, <code>chat_messages</code>, <code>user_settings</code>, <code>grocery_lists</code>) plus indexes, Row Level Security policies, and an auto-setup trigger for new users.</p>
          </li>
        </ol>
      </Section>

      {/* Step 4 - Auth */}
      <Section index={4} icon={<KeyRound />} title="Enable authentication (email/password)">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>In Supabase, go to <b>Authentication → Providers</b> and make sure <b>Email</b> is enabled (it is by default).</li>
          <li>(Optional) To let users sign in with Google, Apple, GitHub etc., toggle those providers and paste the OAuth credentials.</li>
          <li>(Optional, but recommended while testing) Under <b>Authentication → Providers → Email</b>, you can disable "Confirm email" for friction-free local development (turn it back on for production).</li>
        </ol>
      </Section>

      {/* Step 5 - Environment variables */}
      <Section index={5} icon={<LayoutTemplate />} title="Add environment variables">
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          In your project root, create a file named <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">.env.local</code> and fill it in.
          You can copy <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">.env.example</code> as a starting point.
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--muted-foreground)] mb-3">
          <li>
            In Supabase go to <b>Settings → API</b>. Copy the <b>Project URL</b> and the <b>anon public</b> key.
          </li>
          <li>
            Get your OpenRouter key from <a className="underline text-[var(--accent)]" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">openrouter.ai/keys</a>.
          </li>
        </ol>
        <CodeBlock language="env" code={
`# .env.local
OPENROUTER_API_KEY=sk-or-v1-...

# Supabase (leave blank to run in local-only / localStorage mode)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
          onCopy={(c) => copy(c, "env")}
          copied={copied === "env"}
        />
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          ⚠️ Never use the Supabase <b>service_role</b> key in the browser. This app only uses the anon key client-side, and runs queries through <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">/api/sync</code> which honours RLS based on the logged-in user.
        </p>
      </Section>

      {/* Step 6 - Run locally */}
      <Section index={6} icon={<Play />} title="Run locally">
        <CodeBlock language="bash" code={
`npm run dev
# → open http://localhost:3000

# Optional: production build
npm run build
npm start`}
          onCopy={(c) => copy(c, "run")}
          copied={copied === "run"}
        />
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          When you visit the app, click <b>Sign up</b> in the top right. Create an account with any email & password (no email confirmation needed if you disabled it). Your data will now sync to Supabase.
        </p>
      </Section>

      {/* Step 7 - Build for production */}
      <Section index={7} icon={<Rocket />} title="Build the production app">
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          SmartThattu is a Next.js App Router project, which builds into a full-stack production bundle (front-end, API routes, PWA manifest).
        </p>
        <CodeBlock language="bash" code={
`npm run build
# outputs: .next/
# Test the production server locally:
npm start`}
          onCopy={(c) => copy(c, "build")}
          copied={copied === "build"}
        />
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-[var(--muted-foreground)]">
          <li>Output is a Node server. Serverless API routes (under <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">/api/ai/*</code>) work on Vercel, Netlify, Cloudflare, Docker, or any Node host.</li>
          <li>All AI keys stay server-side (only <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">OPENROUTER_API_KEY</code> on server; Supabase anon key is public).</li>
        </ul>
      </Section>

      {/* Step 8 - Deploy to Vercel */}
      <Section index={8} icon={<Cloud />} title="Deploy to Vercel (recommended)">
        <ol className="list-decimal pl-5 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>Push your project to GitHub / GitLab / Bitbucket.</li>
          <li>Go to <a className="underline text-[var(--accent)]" href="https://vercel.com/new" target="_blank" rel="noreferrer">vercel.com/new</a>, import the repo.</li>
          <li>
            In <b>Environment Variables</b>, add:
            <ul className="list-disc pl-5 mt-1">
              <li><code>OPENROUTER_API_KEY</code></li>
              <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            </ul>
          </li>
          <li>Click Deploy. Vercel runs <code>npm run build</code> automatically.</li>
          <li>Once live, in Supabase go to <b>Authentication → URL Configuration</b> and add your Vercel domain to the <b>Redirect URLs</b>: <code>https://your-domain.vercel.app/**</code></li>
        </ol>
      </Section>

      {/* Step 9 - Mobile as PWA */}
      <Section index={9} icon={<Smartphone />} title="Install as a mobile / desktop app (PWA)">
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          SmartThattu ships as an installable Progressive Web App. No App Store or Play Store required.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <Card>
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              🤖 Android (Chrome / Edge)
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Open your deployed site in Chrome.</li>
              <li>Wait for the "Install app" banner or tap the ⋮ menu → <b>Install app</b>.</li>
              <li>The icon appears on your home screen and runs full-screen.</li>
            </ol>
          </Card>
          <Card>
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              🍎 iOS (Safari)
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Open your deployed site in Safari.</li>
              <li>Tap the <b>Share</b> icon (⬆️) → <b>Add to Home Screen</b>.</li>
              <li>Name it "SmartThattu" and tap Add.</li>
            </ol>
          </Card>
          <Card className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              💻 Desktop (Chrome / Edge / Arc)
            </div>
            <p className="text-sm">
              Visit the site and look for the install icon (⊕) in the right side of the address bar. Click it to install the app. It opens in its own window, appears in the Dock/Start menu, and works offline when you have a cached shell.
            </p>
          </Card>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          The PWA icon, theme color and manifest are configured in <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">src/app/manifest.ts</code> and <code className="px-1.5 py-0.5 rounded bg-[var(--muted)]">public/icon.svg</code>. For full offline support (optional), you can add a service worker later via <code>next-pwa</code>.
        </p>
      </Section>

      {/* Step 10 - Other deploy targets */}
      <Section index={10} icon={<Server />} title="Other deployment options">
        <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <b>Docker</b>: use the official Next.js Docker template. The build command is <code>npm run build</code> and start command <code>npm start</code>, port 3000.
          </li>
          <li>
            <b>Netlify / Cloudflare Pages</b>: set build command <code>npm run build</code> and publish directory <code>.next</code>. Ensure you use the Next.js runtime plugin.
          </li>
          <li>
            <b>Any VPS</b>: <code>npm install &amp;&amp; npm run build</code>, then run <code>npm start</code> behind a reverse proxy (nginx / Caddy) with PM2.
          </li>
        </ul>
      </Section>

      {/* Success card */}
      {isAuthed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 flex items-start gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">You're connected!</div>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              SmartThattu is synced to your Supabase. Family, meals, chat, and settings will follow you across devices when you sign in. Install the PWA on your phone (Step 9) to get the full app experience.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link href="/family">
          <Button variant="accent">
            <Rocket className="w-4 h-4" /> Launch SmartThattu
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">← Home</Button>
        </Link>
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  icon,
  children,
}: {
  index: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md">
          {icon}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
            Step {index}
          </div>
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
        </div>
      </div>
      <div>{children}</div>
    </motion.section>
  );
}

function CodeBlock({
  code,
  language,
  onCopy,
  copied,
}: {
  code: string;
  language: string;
  onCopy: (c: string) => void;
  copied: boolean;
}) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
          {language}
        </span>
        <button
          onClick={() => onCopy(code)}
          className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition"
          aria-label="Copy"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="bg-[#0b0b10] text-[13px] leading-relaxed text-zinc-100 rounded-2xl p-4 pt-10 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

