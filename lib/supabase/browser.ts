"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function isSupabaseRealtimeConfigured(): boolean {
  return Boolean(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]?.trim() &&
      process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]?.trim()
  );
}

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseRealtimeConfigured()) return null;

  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"]!.trim();
  const key = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!.trim();

  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }

  return browserClient;
}
