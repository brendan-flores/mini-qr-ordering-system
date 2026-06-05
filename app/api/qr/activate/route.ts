import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

  if (!table || !access) {
    return NextResponse.json(
      { ok: false, error: "Scan a table QR code to order." },
      { status: 400 }
    );
  }

  const sessionToken = await tryActivateQrOrderSession(table, access);
  if (!sessionToken) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired table QR code." },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ ok: true, table });
  attachQrOrderSessionCookie(res, sessionToken);
  return res;
}
