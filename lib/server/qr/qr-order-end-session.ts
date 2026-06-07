import type { NextResponse } from "next/server";
import { normalizeDeviceId } from "@/lib/client/device/device-id";
import { releaseQrAccessBinding } from "@/lib/server/db/qr-access-bindings";
import {
  QR_ORDER_SESSION_COOKIE,
  qrOrderSessionCookieOptions,
  type QrOrderSessionPayload,
} from "@/lib/server/qr/qr-order-session";

/** Drop the DB binding so another device may scan the same printed QR. */
export async function releaseQrOrderSessionBinding(
  session: QrOrderSessionPayload | null | undefined,
  deviceId?: string | null
): Promise<void> {
  if (!session?.jti) return;

  const normalizedDeviceId = normalizeDeviceId(deviceId ?? session.deviceId);
  if (!normalizedDeviceId || session.deviceId !== normalizedDeviceId) return;

  await releaseQrAccessBinding(session.jti, normalizedDeviceId);
}

export function clearQrOrderSessionCookie(response: NextResponse): void {
  response.cookies.set(QR_ORDER_SESSION_COOKIE, "", {
    ...qrOrderSessionCookieOptions(0),
    maxAge: 0,
  });
}
