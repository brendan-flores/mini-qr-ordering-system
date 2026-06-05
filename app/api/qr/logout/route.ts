import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/qr-order-end-session";
import { logQrSession } from "@/lib/qr-session-log";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

async function endQrLogout(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );
  const accessToken = request.nextUrl.searchParams.get("access");

  logQrSession("logout_api", {
    method: request.method,
    hasSession: Boolean(session?.jti),
    hasDeviceId: Boolean(deviceId),
    hasAccessFallback: Boolean(accessToken),
    userAgent: request.headers.get("user-agent")?.slice(0, 120) ?? null,
  });

  const released = await releaseQrOrderSessionBinding(session, deviceId, {
    accessToken,
  });

  const res = NextResponse.json({ ok: true, released });
  clearQrOrderSessionCookie(res);
  return res;
}

/** POST — normal logout and tab/browser-close keepalive requests. */
export async function POST(request: NextRequest) {
  return endQrLogout(request);
}

/**
 * GET — some mobile browsers send sendBeacon / unload pings as GET.
 * Same behavior as POST; cookie or access+device_id can release binding.
 */
export async function GET(request: NextRequest) {
  return endQrLogout(request);
}
