import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { UpdatePaymentSchema } from "../../../../../schemas/order.schemas.js";
import { updateMockOrderPaymentStatus } from "../../../../../services/mock-data.service.js";

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

    if (!isSupabaseConfigured()) {
      const updated = updateMockOrderPaymentStatus({ id, ...parsed });
      return NextResponse.json({ data: updated });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: parsed.payment_status })
      .eq("id", id)
      .select("id,items,total_amount,payment_status,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data });
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
