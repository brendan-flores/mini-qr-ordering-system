import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasSupabaseConfig = Boolean(url && serviceRoleKey);

export const supabase = hasSupabaseConfig
  ? createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

export { hasSupabaseConfig };

