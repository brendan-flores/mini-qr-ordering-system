import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "bc_admin_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

export type AdminSessionPayload = {
  userId: string;
  username: string;
  exp: number;
};

const encoder = new TextEncoder();

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "development") {
    return "dev-only-change-admin-session-secret";
  }
  throw new Error("ADMIN_SESSION_SECRET is not set");
}

async function importHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function hmacSign(data: string): Promise<string> {
  const key = await importHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(sig).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminSessionToken(
  user: Pick<AdminSessionPayload, "userId" | "username">
): Promise<string> {
  const payload: AdminSessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${await hmacSign(data)}`;
}

export async function parseAdminSessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const expected = await hmacSign(data);
    if (!safeEqual(sig, expected)) return null;

    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (
      !payload?.userId ||
      !payload?.username ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSessionPayload | null> {
  return parseAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
}

export function adminSessionCookieOptions(maxAge = SESSION_TTL_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
