import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/client/device/device-id";
import { getErrorMessage } from "@/lib/server/services/db-errors";
import { QR_SESSION_TERMINATED_MESSAGE } from "@/lib/client/qr/qr-inactivity";
import {
  attachQrOrderSessionCookie,
  tryActivateQrOrderSession,
} from "@/lib/server/qr/qr-order-activate";
import { normalizeTableNumber } from "@/lib/client/session/table";

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
      const message =
        result.reason === "revoked"
          ? QR_SESSION_TERMINATED_MESSAGE
          : result.reason === "device_mismatch"
            ? "This QR link is registered to another device. Scan the code on your own phone to order."
            : "Invalid or expired table QR code.";
      return NextResponse.json(
        {
          ok: false,
          error: message,
          code:
            result.reason === "revoked"
              ? "REVOKED_BY_STAFF"
              : result.reason === "device_mismatch"
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
    const hint = message.includes("qr_access_bindings")
      ? " Database setup required: run database/schema.sql"
      : "";
    return NextResponse.json(
      { ok: false, error: `${message}${hint}` },
      { status: 500 }
    );
  }
}
