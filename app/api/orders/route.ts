import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { CreateOrderSchema } from "../../../schemas/order.schemas.js";
import {
  createMockOrder,
  listMockOrders,
} from "../../../services/mock-data.service.js";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ data: listMockOrders() });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("id,items,total_amount,payment_status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = CreateOrderSchema.parse(body);

    if (!isSupabaseConfigured()) {
      const order = createMockOrder(parsed);
      return NextResponse.json({ data: order }, { status: 201 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        items: parsed.items,
        total_amount: parsed.total_amount,
        payment_status: "Pending",
      })
      .select("id,items,total_amount,payment_status,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
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
