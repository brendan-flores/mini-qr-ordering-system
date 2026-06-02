import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateOrderPaymentStatus } from "../../../../../services/orders.service.js";

const UpdatePaymentSchema = z.object({
  payment_status: z.enum(["Pending", "Paid", "Failed"]),
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

    const body = (await request.json()) as unknown;
    const parsed = UpdatePaymentSchema.parse(body);
    const updated = await updateOrderPaymentStatus({ id, ...parsed });
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Validation error", issues: error.issues } },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
