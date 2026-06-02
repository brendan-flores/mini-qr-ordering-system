import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
import { patchOrderStatus } from "@/lib/orders/order-service";
import { UpdateOrderStatusSchema } from "../../../../../schemas/order.schemas.js";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) {
    return adminUnauthorized();
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: { message: "Missing id" } },
        { status: 400 }
      );
    }

    const body = (await request.json()) as unknown;
    const parsed = UpdateOrderStatusSchema.parse(body);
    const data = await patchOrderStatus(id, parsed.order_status);

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Validation error", issues: error.issues } },
        { status: 400 }
      );
    }
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: number }).status === "number"
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status });
  }
}
