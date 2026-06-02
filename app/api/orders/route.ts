import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth";
import { createOrderRecord } from "@/lib/orders/order-service";
import { getErrorMessage } from "@/lib/orders/supabase-order-errors";
import { CreateOrderSchema } from "../../../schemas/order.schemas.js";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return adminUnauthorized();
  }
  return NextResponse.json(
    {
      error: {
        message: "Use GET /api/admin/orders for the admin dashboard.",
      },
    },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = CreateOrderSchema.parse(body);

    const payment_status =
      parsed.payment_method === "cod"
        ? "Pending"
        : parsed.payment_status!;

    const service_type = parsed.service_type ?? "dine_in";
    const table_number =
      service_type === "takeout"
        ? null
        : parsed.table_number?.trim() || "1";

    const data = await createOrderRecord({
      items: parsed.items,
      total_amount: parsed.total_amount,
      payment_method: parsed.payment_method,
      payment_status,
      table_number,
      service_type,
    });

    return NextResponse.json({ data }, { status: 201 });
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
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status });
  }
}
