import { createClient } from "@supabase/supabase-js";

let cachedClient = null;

function readEnv(name) {
  // Bracket access avoids Turbopack replacing unknown process.env.* at compile time.
  return process.env[name]?.trim() ?? "";
}

/** Read env at call time so Next.js API routes see .env after startup. */
export function getSupabaseConfig() {
  const url = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  return {
    url,
    serviceRoleKey,
    isConfigured: Boolean(url && serviceRoleKey),
  };
}

export function getSupabase() {
  const { url, serviceRoleKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}
