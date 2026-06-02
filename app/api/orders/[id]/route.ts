import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders/order-service";

export async function GET(
  _request: Request,
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

    const data = await getOrderById(id);
    if (!data) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
