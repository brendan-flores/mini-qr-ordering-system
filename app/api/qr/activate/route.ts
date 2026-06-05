import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/device-id";
import { getErrorMessage } from "@/lib/orders/db-errors";
import {
  attachQrOrderSessionCookie,
  tryActivateQrOrderSession,
} from "@/lib/qr-order-activate";
import { logQrSession } from "@/lib/qr-session-log";
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

  if (!deviceId) {
    return NextResponse.json(
      { ok: false, error: "Device identification is required." },
      { status: 400 }
    );
  }

  try {
    const result = await tryActivateQrOrderSession({
      tableNumber: table,
      accessToken: access,
      deviceId,
    });

    if (!result.ok) {
      logQrSession("activate_denied", {
        table,
        deviceId,
        reason: result.reason,
        userAgent: request.headers.get("user-agent")?.slice(0, 120) ?? null,
      });
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

    logQrSession("activate_ok", {
      table: result.table,
      deviceId,
      bind: result.bind,
      userAgent: request.headers.get("user-agent")?.slice(0, 120) ?? null,
    });

    const res = NextResponse.json({ ok: true, table: result.table });
    attachQrOrderSessionCookie(res, result.sessionToken);
    return res;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const hint = message.includes("qr_access_bindings")
      ? " Database setup required: run mysql/schema.sql"
      : "";
    return NextResponse.json(
      { ok: false, error: `${message}${hint}` },
      { status: 500 }
    );
  }
}
