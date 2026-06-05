import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import {
  clearQrOrderSessionCookie,
  releaseQrOrderSessionBinding,
} from "@/lib/qr-order-end-session";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

export async function POST(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  await releaseQrOrderSessionBinding(session, deviceId);

  const res = NextResponse.json({ ok: true });
  clearQrOrderSessionCookie(res);
  return res;
}
