import type { NextRequest } from "next/server";
import { isQrOrderEnforcedOnRequest } from "@/lib/qr-order-env";
import { getQrOrderSessionFromRequest } from "@/lib/qr-order-session";

type OrderCreateInput = {
  service_type?: "dine_in" | "takeout";
  table_number?: string | null;
};

function qrSessionRequiredError(): Error & { status: number } {
  const err = new Error(
    "Orders are only accepted after scanning a table QR code."
  ) as Error & { status: number };
  err.status = 403;
  return err;
}

function qrTableMismatchError(): Error & { status: number } {
  const err = new Error(
    "Dine-in orders must use the table number from your QR scan."
  ) as Error & { status: number };
  err.status = 403;
  return err;
}

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
    throw qrSessionRequiredError();
  }

  const serviceType = input.service_type ?? "dine_in";
  if (serviceType === "dine_in") {
    const table = input.table_number?.trim();
    if (!table || table !== session.table) {
      throw qrTableMismatchError();
    }
  }
}

/** Live server dine-in: always use the table from the QR session cookie. */
export async function authorizedDineInTableNumber(
  request: NextRequest,
  clientTable: string | null | undefined
): Promise<string | null> {
  if (!isQrOrderEnforcedOnRequest(request)) {
    return clientTable?.trim() || null;
  }

  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    throw qrSessionRequiredError();
  }

  const table = clientTable?.trim();
  if (!table || table !== session.table) {
    throw qrTableMismatchError();
  }

  return session.table;
}
