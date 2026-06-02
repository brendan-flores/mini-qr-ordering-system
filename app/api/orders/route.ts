import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, listOrders } from "../../../services/orders.service.js";

const OrderItemSchema = z.object({
  product_id: z.union([z.string().uuid(), z.number()]),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1),
  image_url: z.string().url().optional().nullable(),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  total_amount: z.number().positive(),
});

export async function GET() {
  try {
    const orders = await listOrders();
    return NextResponse.json({ data: orders });
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
    const order = await createOrder(parsed);
    return NextResponse.json({ data: order }, { status: 201 });
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
