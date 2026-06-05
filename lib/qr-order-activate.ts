import {
  createQrOrderSessionToken,
  qrOrderSessionCookieOptions,
  QR_ORDER_SESSION_COOKIE,
} from "@/lib/qr-order-session";
import { bindQrAccessToDevice } from "@/lib/mysql/qr-access-bindings";
import { validateTableQrAccess } from "@/lib/table-qr-access";
import { normalizeTableNumber } from "@/lib/table";
import type { NextResponse } from "next/server";

export type QrActivateResult =
  | { ok: true; sessionToken: string; table: string }
  | { ok: false; reason: "invalid" | "device_mismatch" };

export async function tryActivateQrOrderSession(
  tableNumber: string,
  accessToken: string,
  deviceId: string,
  enforceDeviceBinding: boolean
): Promise<QrActivateResult> {
  const table = normalizeTableNumber(tableNumber);
  if (!table) return { ok: false, reason: "invalid" };

  const access = await validateTableQrAccess(table, accessToken);
  if (!access) return { ok: false, reason: "invalid" };

  if (enforceDeviceBinding) {
    const bindResult = await bindQrAccessToDevice(
      access.jti,
      table,
      deviceId
    );
    if (bindResult === "denied") {
      return { ok: false, reason: "device_mismatch" };
    }
  }

  const sessionToken = await createQrOrderSessionToken(
    table,
    access.jti,
    deviceId
  );
  return { ok: true, sessionToken, table };
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
