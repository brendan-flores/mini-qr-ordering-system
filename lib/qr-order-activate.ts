import {
  createQrOrderSessionToken,
  qrOrderSessionCookieOptions,
  QR_ORDER_SESSION_COOKIE,
} from "@/lib/qr-order-session";
import { validateTableQrAccess } from "@/lib/table-qr-access";
import { normalizeTableNumber } from "@/lib/table";
import type { NextResponse } from "next/server";

export async function tryActivateQrOrderSession(
  tableNumber: string,
  accessToken: string
): Promise<string | null> {
  const table = normalizeTableNumber(tableNumber);
  if (!table) return null;

  const access = await validateTableQrAccess(table, accessToken);
  if (!access) return null;

  return createQrOrderSessionToken(table, access.jti);
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
