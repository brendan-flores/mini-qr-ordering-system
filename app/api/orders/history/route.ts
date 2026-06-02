import { NextResponse } from "next/server";
import { z } from "zod";
import { listAllOrders } from "@/lib/orders/order-service";
import { getErrorMessage } from "@/lib/orders/supabase-order-errors";

const BodySchema = z.object({
  ids: z.array(z.string().min(1)).max(50),
});

/** Fetch multiple orders by id in one request (device order history). */
export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    const idSet = new Set(body.ids.map(String));
    if (idSet.size === 0) {
      return NextResponse.json({ data: [] });
    }

    const all = await listAllOrders();
    const data = all.filter((order) => idSet.has(String(order.id)));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Validation error", issues: error.issues } },
        { status: 400 }
      );
    }
    const message = getErrorMessage(error);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
