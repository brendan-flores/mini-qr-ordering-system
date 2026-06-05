import type { NextRequest } from "next/server";

export const QR_ORDER_SESSION_COOKIE = "bc_qr_order_session";
const SESSION_TTL_SEC = 60 * 60 * 4; // hard cap — inactivity ends sooner (15 min)

export type QrOrderSessionPayload = {
  table: string;
  /** Access token id from the scanned QR — binds session to that code. */
  jti?: string;
  /** Browser device id — must match the first device that scanned this QR. */
  deviceId?: string;
  /** Unix seconds — updated on activity; inactivity timeout applies on live server. */
  lastActive?: number;
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

export async function signQrOrderSessionPayload(
  payload: QrOrderSessionPayload
): Promise<string> {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${await hmacSign(data)}`;
}

export async function createQrOrderSessionToken(
  table: string,
  accessJti?: string,
  deviceId?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: QrOrderSessionPayload = {
    table,
    ...(accessJti ? { jti: accessJti } : {}),
    ...(deviceId ? { deviceId } : {}),
    lastActive: now,
    exp: now + SESSION_TTL_SEC,
  };
  return signQrOrderSessionPayload(payload);
}

export async function touchQrOrderSessionToken(
  payload: QrOrderSessionPayload
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signQrOrderSessionPayload({
    ...payload,
    lastActive: now,
  });
}

export async function parseQrOrderSessionToken(
  token: string | undefined | null
): Promise<QrOrderSessionPayload | null> {
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
    ) as QrOrderSessionPayload;

    if (!payload?.table || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getQrOrderSessionFromRequest(
  request: NextRequest
): Promise<QrOrderSessionPayload | null> {
  return parseQrOrderSessionToken(
    request.cookies.get(QR_ORDER_SESSION_COOKIE)?.value
  );
}

export function qrOrderSessionCookieOptions(maxAge = SESSION_TTL_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
