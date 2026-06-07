import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/client/device/device-id";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/server/qr/qr-order-end-session";
import { getQrOrderSessionFromRequest } from "@/lib/server/qr/qr-order-session";

async function endQrLogout(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  await releaseQrOrderSessionBinding(session, deviceId);

  const res = NextResponse.json({ ok: true });
  clearQrOrderSessionCookie(res);
  return res;
}

/** POST — normal logout and tab/browser-close keepalive requests. */
export async function POST(request: NextRequest) {
  return endQrLogout(request);
}

/**
 * GET — some mobile browsers send sendBeacon / unload pings as GET.
 * Same behavior as POST; still requires the session cookie to release binding.
 */
export async function GET(request: NextRequest) {
  return endQrLogout(request);
}
