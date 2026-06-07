import { NextResponse } from "next/server";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/auth/admin-auth";
import { listAllOrders } from "@/lib/server/services/order-service";
import { getErrorMessage } from "@/lib/server/services/db-errors";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request as import("next/server").NextRequest))) {
    return adminUnauthorized();
  }

  try {
    const data = (await listAllOrders()).filter(
      (order) => order.payment_status !== "Failed"
    );
    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
