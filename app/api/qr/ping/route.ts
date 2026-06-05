import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { isQrSessionInactive } from "@/lib/qr-inactivity";
import { isDeviceAuthorizedForQrAccess } from "@/lib/mysql/qr-access-bindings";
import { attachQrOrderSessionCookie } from "@/lib/qr-order-activate";
import {
  getQrOrderSessionFromRequest,
  touchQrOrderSessionToken,
  QR_ORDER_SESSION_COOKIE,
  qrOrderSessionCookieOptions,
} from "@/lib/qr-order-session";

export async function GET(request: NextRequest) {
  if (!isQrOrderEnforcedOnRequest(request)) {
    return NextResponse.json({ ok: true });
  }

  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );
  if (
    !deviceId ||
    session.deviceId !== deviceId ||
    !(await isDeviceAuthorizedForQrAccess(session.jti, deviceId))
  ) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (isQrSessionInactive(session.lastActive)) {
    const res = NextResponse.json({ ok: false, inactive: true }, { status: 403 });
    res.cookies.set(QR_ORDER_SESSION_COOKIE, "", {
      ...qrOrderSessionCookieOptions(0),
      maxAge: 0,
    });
    return res;
  }

  const sessionToken = await touchQrOrderSessionToken(session);
  const res = NextResponse.json({ ok: true });
  attachQrOrderSessionCookie(res, sessionToken);
  return res;
}
