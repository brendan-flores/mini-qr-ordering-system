import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/client/device/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/shared/config/qr-order-env";
import { shouldExpireQrSessionForInactivity } from "@/lib/server/qr/qr-session-inactivity-policy";
import {
  getQrAccessBinding,
  isDeviceAuthorizedForQrAccess,
  touchQrAccessBinding,
} from "@/lib/server/db/qr-access-bindings";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/server/qr/qr-order-end-session";
import { getQrOrderSessionFromRequest } from "@/lib/server/qr/qr-order-session";

export async function GET(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    return NextResponse.json({ active: false });
  }

  if (!isQrOrderEnforcedOnRequest()) {
    return NextResponse.json({ active: true, table: session.table });
  }

  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  const binding = await getQrAccessBinding(session.jti);
  if (!binding) {
    const res = NextResponse.json({ active: false, terminated: true });
    clearQrOrderSessionCookie(res);
    return res;
  }

  if (
    !deviceId ||
    session.deviceId !== deviceId ||
    !(await isDeviceAuthorizedForQrAccess(session.jti, deviceId))
  ) {
    return NextResponse.json({ active: false });
  }

  if (await shouldExpireQrSessionForInactivity(session, deviceId)) {
    await releaseQrOrderSessionBinding(session, deviceId);
    const res = NextResponse.json({ active: false, inactive: true });
    clearQrOrderSessionCookie(res);
    return res;
  }

  await touchQrAccessBinding(session.jti, deviceId);

  return NextResponse.json({ active: true, table: session.table });
}
