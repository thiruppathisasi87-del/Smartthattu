"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { supabaseBrowserClient } from "@/lib/supabase";

/**
 * On mount, if Supabase is configured and we have a session, pull data from /api/sync.
 * Also keep a ref to the client to subscribe to auth changes (handled in <Auth>).
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrateFromSupabase);

  useEffect(() => {
    const supabase = supabaseBrowserClient;
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) hydrate();
    });
  }, [hydrate]);

  return <>{children}</>;
}
