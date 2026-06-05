import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { isDeviceAuthorizedForQrAccess } from "@/lib/mysql/qr-access-bindings";
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

  return NextResponse.json({ active: true, table: session.table });
}
