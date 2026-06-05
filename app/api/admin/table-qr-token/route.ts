import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
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
    const access = await createTableQrAccessToken(table);
    return NextResponse.json({ table_number: table, access });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not create QR token.";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
