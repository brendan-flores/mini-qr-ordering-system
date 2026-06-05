import { normalizeTableNumber } from "@/lib/table";

export type TableQrAccessPayload = {
  table: string;
  jti: string;
  exp: number;
};

const ACCESS_TTL_SEC = 60 * 60 * 24 * 365; // printed table QR — 1 year

const encoder = new TextEncoder();

function accessSecret(): string {
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
    encoder.encode(accessSecret()),
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

export type TableQrAccessIssue = {
  access: string;
  jti: string;
  table: string;
};

/** Admin-only: signed token embedded in printed QR codes. */
export async function createTableQrAccessToken(
  tableNumber: string
): Promise<TableQrAccessIssue> {
  const table = normalizeTableNumber(tableNumber);
  if (!table) {
    throw new Error("Invalid table number.");
  }

  const payload: TableQrAccessPayload = {
    table,
    jti: crypto.randomUUID(),
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SEC,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return {
    access: `${data}.${await hmacSign(data)}`,
    jti: payload.jti,
    table,
  };
}

export async function parseTableQrAccessToken(
  token: string | null | undefined
): Promise<TableQrAccessPayload | null> {
  if (!token?.trim()) return null;
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;

  const data = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);

  try {
    const expected = await hmacSign(data);
    if (!safeEqual(sig, expected)) return null;

    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    ) as TableQrAccessPayload;

    if (!payload?.table || !payload?.jti || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!normalizeTableNumber(payload.table)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** True when `access` matches `table` and signature is valid. */
export async function validateTableQrAccess(
  tableNumber: string,
  accessToken: string
): Promise<TableQrAccessPayload | null> {
  const table = normalizeTableNumber(tableNumber);
  if (!table) return null;

  const payload = await parseTableQrAccessToken(accessToken);
  if (!payload || payload.table !== table) return null;
  return payload;
}
