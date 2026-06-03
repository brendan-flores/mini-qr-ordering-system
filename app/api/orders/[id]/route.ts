import { NextRequest, NextResponse } from "next/server";
import {
  assertOrderOwnedByDevice,
  getOrderById,
} from "@/lib/orders/order-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: { message: "Missing id" } },
        { status: 400 }
      );
    }

    const deviceId = request.nextUrl.searchParams.get("device_id");
    const data = await getOrderById(id);
    if (!data) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      );
    }

    try {
      assertOrderOwnedByDevice(data, deviceId);
    } catch (e: unknown) {
      const status =
        typeof e === "object" &&
        e !== null &&
        "status" in e &&
        typeof (e as { status: number }).status === "number"
          ? (e as { status: number }).status
          : 404;
      const message = e instanceof Error ? e.message : "Order not found";
      return NextResponse.json({ error: { message } }, { status });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
