import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/orders/db-errors";
import { createQrScanCode } from "@/lib/mysql/qr-scan-codes";
import { createTableQrAccessToken } from "@/lib/table-qr-access";
import { normalizeTableNumber } from "@/lib/table";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return adminUnauthorized();
  }

  let body: { table_number?: string };
  try {
    body = (await request.json()) as { table_number?: string };
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const table = normalizeTableNumber(body.table_number);
  if (!table) {
    return NextResponse.json(
      { error: { message: "Enter a valid whole-number table." } },
      { status: 400 }
    );
  }

  try {
    const issued = await createTableQrAccessToken(table);
    const scanCode = await createQrScanCode(
      issued.table,
      issued.jti,
      issued.access
    );
    return NextResponse.json({
      table_number: issued.table,
      scan_code: scanCode,
    });
  } catch (e: unknown) {
    const message = getErrorMessage(e);
    const hint = message.includes("qr_scan_codes")
      ? " Run mysql/patch-qr-access-bindings.sql on your database."
      : "";
    return NextResponse.json(
      { error: { message: `${message}${hint}` } },
      { status: 500 }
    );
  }
}
