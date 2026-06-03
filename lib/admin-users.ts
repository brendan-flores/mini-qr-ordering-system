import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  username: string;
};

/** Verify credentials against `admin_users` via Supabase RPC (no plaintext in app code). */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("verify_admin_login", {
    p_username: username.trim(),
    p_password: password,
  });

  if (error) {
    const hint = error.message.includes("verify_admin_login")
      ? " Run supabase/patch-admin-users.sql in Supabase SQL Editor."
      : "";
    throw new Error(`${error.message}${hint}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id || !row?.username) return null;

  return { id: String(row.id), username: String(row.username) };
}
