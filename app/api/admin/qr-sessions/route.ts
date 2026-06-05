import { NextResponse } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
import { listQrAccessBindings } from "@/lib/mysql/qr-access-bindings";
import { getErrorMessage } from "@/lib/orders/db-errors";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request as import("next/server").NextRequest))) {
    return adminUnauthorized();
  }

  try {
    const data = await listQrAccessBindings();
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
