import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { isMysqlConfigured, mysqlConfigError, query } from "@/lib/mysql/db";

export type AdminUser = {
  id: string;
  username: string;
};

/** Verify credentials against `admin_users` (bcrypt password_hash). */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  if (!isMysqlConfigured()) {
    throw new Error(mysqlConfigError());
  }

  const normalized = username.trim();
  const rows = await query<RowDataPacket[]>(
    `SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1`,
    [normalized]
  );
  const row = rows[0];
  if (!row?.password_hash || !row.id) return null;

  const hash = String(row.password_hash);
  if (!hash.startsWith("$2")) return null;

  const ok = await bcrypt.compare(password, hash);
  if (!ok) return null;

  return { id: String(row.id), username: String(row.username) };
}
