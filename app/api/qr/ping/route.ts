import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { shouldExpireQrSessionForInactivity } from "@/lib/qr-session-inactivity-policy";
import {
  getQrAccessBinding,
  isDeviceAuthorizedForQrAccess,
  touchQrAccessBinding,
} from "@/lib/mysql/qr-access-bindings";
import { attachQrOrderSessionCookie } from "@/lib/qr-order-activate";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/qr-order-end-session";
import {
  getQrOrderSessionFromRequest,
  touchQrOrderSessionToken,
} from "@/lib/qr-order-session";

export async function GET(request: NextRequest) {
  if (!isQrOrderEnforcedOnRequest()) {
    return NextResponse.json({ ok: true });
  }

  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  const binding = await getQrAccessBinding(session.jti);
  if (!binding) {
    const res = NextResponse.json(
      { ok: false, terminated: true },
      { status: 403 }
    );
    clearQrOrderSessionCookie(res);
    return res;
  }

  if (
    !deviceId ||
    session.deviceId !== deviceId ||
    !(await isDeviceAuthorizedForQrAccess(session.jti, deviceId))
  ) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (await shouldExpireQrSessionForInactivity(session, deviceId)) {
    await releaseQrOrderSessionBinding(session, deviceId);
    const res = NextResponse.json({ ok: false, inactive: true }, { status: 403 });
    clearQrOrderSessionCookie(res);
    return res;
  }

  await touchQrAccessBinding(session.jti, deviceId);

  const sessionToken = await touchQrOrderSessionToken(session);
  const res = NextResponse.json({ ok: true });
  attachQrOrderSessionCookie(res, sessionToken);
  return res;
}
