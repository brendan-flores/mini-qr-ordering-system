import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminUnauthorized, isAdminRequest } from "@/lib/server/auth/admin-auth";
import { createOrderRecord } from "@/lib/server/services/order-service";
import { getErrorMessage } from "@/lib/server/services/db-errors";
import {
  assertQrOrderAllowed,
  authorizedDineInTableNumber,
} from "@/lib/server/qr/qr-order-guard";
import { IntegerTableNumberError } from "@/lib/client/session/table";
import { readRequestJson } from "@/lib/shared/utils/json";
import { CreateOrderSchema } from "@/schemas/order.schemas.js";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
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
    const body = await readRequestJson(request);
    if (body === null) {
      return NextResponse.json(
        { error: { message: "Request body is required" } },
        { status: 400 }
      );
    }
    const parsed = CreateOrderSchema.parse(body);

    const service_type = parsed.service_type ?? "dine_in";

    await assertQrOrderAllowed(
      request,
      {
        service_type,
        table_number: parsed.table_number ?? null,
      },
      parsed.device_id
    );

    const payment_status =
      parsed.payment_method === "cod"
        ? "Pending"
        : parsed.payment_status!;

    const table_number =
      service_type === "takeout"
        ? null
        : await authorizedDineInTableNumber(
            request,
            parsed.table_number ?? null,
            parsed.device_id
          );

    const data = await createOrderRecord({
      items: parsed.items,
      total_amount: parsed.total_amount,
      payment_method: parsed.payment_method,
      payment_status,
      table_number,
      service_type,
      client_device_id: parsed.device_id?.trim() ?? null,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof IntegerTableNumberError) {
      return NextResponse.json(
        { error: { message: error.message, code: error.code } },
        { status: 400 }
      );
    }
    if (error instanceof z.ZodError) {
      const tableIssue = error.issues.find((i) =>
        i.path.includes("table_number")
      );
      return NextResponse.json(
        {
          error: {
            message:
              tableIssue?.message ??
              "Validation error — only whole-number table values are accepted.",
            issues: error.issues,
          },
        },
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
