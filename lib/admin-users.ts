import bcrypt from "bcryptjs";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  username: string;
};

function rowFromRpc(data: unknown): AdminUser | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const id = (row as { id?: unknown }).id;
  const username = (row as { username?: unknown }).username;
  if (!id || !username) return null;
  return { id: String(id), username: String(username) };
}

async function verifyViaRpc(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  username: string,
  password: string
): Promise<AdminUser | null> {
  const { data, error } = await supabase.rpc("verify_admin_login", {
    p_username: username,
    p_password: password,
  });

  if (error) {
    const hint = error.message.includes("verify_admin_login")
      ? " Run supabase/patch-admin-users.sql in Supabase SQL Editor."
      : "";
    throw new Error(`${error.message}${hint}`);
  }

  return rowFromRpc(data);
}

/** Fallback when RPC returns no row but hash in DB is valid bcrypt (pgcrypto). */
async function verifyViaBcrypt(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  username: string,
  password: string
): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.password_hash || !data.id) return null;

  const hash = String(data.password_hash);
  if (!hash.startsWith("$2")) return null;

  const ok = await bcrypt.compare(password, hash);
  if (!ok) return null;

  return { id: String(data.id), username: String(data.username) };
}

/** Verify credentials against `admin_users` (Supabase RPC, with bcrypt fallback). */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const normalized = username.trim();
  const supabase = getSupabaseAdmin();

  const fromRpc = await verifyViaRpc(supabase, normalized, password);
  if (fromRpc) return fromRpc;

  return verifyViaBcrypt(supabase, normalized, password);
}
