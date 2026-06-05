import {
  createQrOrderSessionToken,
  qrOrderSessionCookieOptions,
  QR_ORDER_SESSION_COOKIE,
} from "@/lib/qr-order-session";
import { bindQrAccessToDevice } from "@/lib/mysql/qr-access-bindings";
import { resolveQrActivateCredentials } from "@/lib/qr-resolve-access";
import type { NextResponse } from "next/server";

export type QrActivateResult =
  | { ok: true; sessionToken: string; table: string; bind: string }
  | { ok: false; reason: "invalid" | "device_mismatch" | "revoked" };

export async function tryActivateQrOrderSession(input: {
  tableNumber?: string | null;
  accessToken?: string | null;
  deviceId: string;
}): Promise<QrActivateResult> {
  const resolved = await resolveQrActivateCredentials({
    tableNumber: input.tableNumber,
    accessToken: input.accessToken,
  });
  if (!resolved) return { ok: false, reason: "invalid" };

  const { table, access } = resolved;

  const bindResult = await bindQrAccessToDevice(
    access.jti,
    table,
    input.deviceId
  );
  if (bindResult === "revoked") {
    return { ok: false, reason: "revoked" };
  }
  if (bindResult === "denied") {
    return { ok: false, reason: "device_mismatch" };
  }

  const sessionToken = await createQrOrderSessionToken(
    table,
    access.jti,
    input.deviceId
  );
  return { ok: true, sessionToken, table, bind: bindResult };
}

export function attachQrOrderSessionCookie(
  response: NextResponse,
  sessionToken: string
) {
  response.cookies.set(
    QR_ORDER_SESSION_COOKIE,
    sessionToken,
    qrOrderSessionCookieOptions()
  );
}
