import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

export async function GET(request: NextRequest) {
  const session = await getQrOrderSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ active: false });
  }
  return NextResponse.json({ active: true, table: session.table });
}
