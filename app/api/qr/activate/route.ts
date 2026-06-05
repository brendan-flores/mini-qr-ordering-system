import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { getErrorMessage } from "@/lib/orders/db-errors";
import {
  attachQrOrderSessionCookie,
  tryActivateQrOrderSession,
} from "@/lib/qr-order-activate";
import { normalizeTableNumber } from "@/lib/table";

export async function GET(request: NextRequest) {
  const table = normalizeTableNumber(
    request.nextUrl.searchParams.get("table")
  );
  const access = request.nextUrl.searchParams.get("access")?.trim();
  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  if (!table || !access) {
    return NextResponse.json(
      { ok: false, error: "Scan a table QR code to order." },
      { status: 400 }
    );
  }

  if (isQrOrderEnforcedOnRequest(request) && !deviceId) {
    return NextResponse.json(
      { ok: false, error: "Device identification is required." },
      { status: 400 }
    );
  }

  try {
    const result = await tryActivateQrOrderSession({
      tableNumber: table,
      accessToken: access,
      deviceId: deviceId ?? "local-dev",
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid or expired table QR code.",
          code: "INVALID_QR",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({ ok: true, table: result.table });
    attachQrOrderSessionCookie(res, result.sessionToken);
    return res;
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
