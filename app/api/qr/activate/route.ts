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
  const scanCode = request.nextUrl.searchParams.get("code")?.trim();
  const deviceId = normalizeDeviceId(
    request.nextUrl.searchParams.get("device_id")
  );

  if (!scanCode && (!table || !access)) {
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
      scanCode,
      deviceId: deviceId ?? "local-dev",
      enforceDeviceBinding: isQrOrderEnforcedOnRequest(request),
    });

    if (!result.ok) {
      const message =
        result.reason === "device_mismatch"
          ? "This QR link is registered to another device. Scan the code on your own phone to order."
          : "Invalid or expired table QR code.";
      return NextResponse.json(
        {
          ok: false,
          error: message,
          code:
            result.reason === "device_mismatch"
              ? "DEVICE_MISMATCH"
              : "INVALID_QR",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({ ok: true, table: result.table });
    attachQrOrderSessionCookie(res, result.sessionToken);
    return res;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const hint = message.includes("qr_scan_codes")
      ? " Database migration required: run mysql/patch-qr-access-bindings.sql"
      : "";
    return NextResponse.json(
      { ok: false, error: `${message}${hint}` },
      { status: 500 }
    );
  }
}
