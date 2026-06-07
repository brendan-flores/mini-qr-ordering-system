import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonText } from "@/lib/shared/utils/json";
import { cancelOrderByCustomer } from "@/lib/server/services/order-service";

const BodySchema = z.object({
  device_id: z.string().min(8).max(64).optional(),
});

export async function POST(
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

    let deviceId = request.nextUrl.searchParams.get("device_id");
    if (!deviceId) {
      const raw = await request.text();
      const json = parseJsonText(raw);
      if (json !== null) {
        const parsed = BodySchema.parse(json);
        deviceId = parsed.device_id ?? null;
      }
    }

    const data = await cancelOrderByCustomer(id, deviceId);
    return NextResponse.json({ data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: "Validation error" } },
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
