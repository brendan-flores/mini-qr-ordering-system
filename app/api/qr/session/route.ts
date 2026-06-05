import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { isQrSessionInactive } from "@/lib/qr-inactivity";
import {
  isDeviceAuthorizedForQrAccess,
  touchQrAccessBinding,
} from "@/lib/mysql/qr-access-bindings";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/qr-order-end-session";
import { logQrSession } from "@/lib/qr-session-log";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

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
  if (
    !deviceId ||
    session.deviceId !== deviceId ||
    !(await isDeviceAuthorizedForQrAccess(session.jti, deviceId))
  ) {
    return NextResponse.json({ active: false });
  }

  if (isQrSessionInactive(session.lastActive)) {
    logQrSession("session_inactive", {
      table: session.table,
      deviceId,
      lastActive: session.lastActive,
    });
    await releaseQrOrderSessionBinding(session, deviceId);
    const res = NextResponse.json({ active: false, inactive: true });
    clearQrOrderSessionCookie(res);
    return res;
  }

  await touchQrAccessBinding(session.jti, deviceId);

  return NextResponse.json({ active: true, table: session.table });
}
