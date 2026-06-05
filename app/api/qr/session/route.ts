import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { isQrSessionInactive } from "@/lib/qr-inactivity";
import {
  getQrOrderSessionFromRequest,
  QR_ORDER_SESSION_COOKIE,
  qrOrderSessionCookieOptions,
} from "@/lib/qr-order-session";

export async function GET(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    return NextResponse.json({ active: false });
  }

  if (!isQrOrderEnforcedOnRequest(request)) {
    return NextResponse.json({ active: true, table: session.table });
  }

  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );
  if (!deviceId || session.deviceId !== deviceId) {
    return NextResponse.json({ active: false });
  }

  if (isQrSessionInactive(session.lastActive)) {
    const res = NextResponse.json({ active: false, inactive: true });
    res.cookies.set(QR_ORDER_SESSION_COOKIE, "", {
      ...qrOrderSessionCookieOptions(0),
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.json({ active: true, table: session.table });
}
