import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/auth/admin-auth";
import { readRequestJson } from "@/lib/shared/utils/json";
import {
  getOrderById,
  patchOrderPayment,
} from "@/lib/server/services/order-service";
import { UpdatePaymentSchema } from "@/schemas/order.schemas.js";

const CustomerGcashPaymentSchema = z.object({
  payment_status: z.enum(["Paid", "Failed"]),
});

export async function PATCH(
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

    const body = await readRequestJson(request);
    if (body === null) {
      return NextResponse.json(
        { error: { message: "Request body is required" } },
        { status: 400 }
      );
    }
    const admin = await isAdminRequest(request);

    if (admin) {
      const parsed = UpdatePaymentSchema.parse(body);
      const data = await patchOrderPayment(id, parsed.payment_status);
      return NextResponse.json({ data });
    }

    const parsed = CustomerGcashPaymentSchema.parse(body);
    const existing = await getOrderById(id);
    if (!existing) {
      return NextResponse.json(
        { error: { message: "Order not found" } },
        { status: 404 }
      );
    }
    if (existing.payment_method !== "gcash") {
      return adminUnauthorized();
    }
    if (
      existing.payment_status !== "Pending" &&
      existing.payment_status !== "Failed"
    ) {
      return NextResponse.json(
        { error: { message: "Payment cannot be updated for this order" } },
        { status: 403 }
      );
    }

    const data = await patchOrderPayment(id, parsed.payment_status);
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
