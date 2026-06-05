import type { NextRequest } from "next/server";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

type OrderCreateInput = {
  service_type?: "dine_in" | "takeout";
  table_number?: string | null;
};

/**
 * Production: reject order creation unless a valid table-QR session cookie exists.
 * Dine-in table_number must match the table encoded in the QR session.
 */
export async function assertQrOrderAllowed(
  request: NextRequest,
  input: OrderCreateInput
): Promise<void> {
  if (!isQrOrderEnforcedOnRequest(request)) return;

  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    const err = new Error(
      "Orders are only accepted after scanning a table QR code."
    );
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  const serviceType = input.service_type ?? "dine_in";
  if (serviceType === "dine_in") {
    const table = input.table_number?.trim();
    if (!table || table !== session.table) {
      const err = new Error(
        "Dine-in orders must use the table number from your QR scan."
      );
      (err as Error & { status: number }).status = 403;
      throw err;
    }
  }
}
