import { NextResponse } from "next/server";
import { z } from "zod";
import { listOrdersForDeviceHistory } from "@/lib/orders/order-service";
import { getErrorMessage } from "@/lib/orders/supabase-order-errors";
import { readRequestJson } from "@/lib/json";
import { OrderHistorySchema } from "@/schemas/order.schemas.js";

/** Fetch orders for this device only (ids + device_id must match). */
export async function POST(request: Request) {
  try {
    const raw = await readRequestJson(request);
    if (raw === null) {
      return NextResponse.json(
        { error: { message: "Request body is required" } },
        { status: 400 }
      );
    }
    const body = OrderHistorySchema.parse(raw);
    const data = await listOrdersForDeviceHistory(body.ids, body.device_id);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Validation error" } },
        { status: 400 }
      );
    }
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
