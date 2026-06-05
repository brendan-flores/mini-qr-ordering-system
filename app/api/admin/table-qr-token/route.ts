import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/orders/db-errors";
import { getOrCreateTableQrAccessToken } from "@/lib/table-qr-access";
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
    const issued = await getOrCreateTableQrAccessToken(table);
    return NextResponse.json({
      table_number: issued.table,
      access_token: issued.access,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: { message: getErrorMessage(e) } },
      { status: 500 }
    );
  }
}
