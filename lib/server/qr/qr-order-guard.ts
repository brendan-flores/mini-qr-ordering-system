import type { NextRequest } from "next/server";
import { normalizeDeviceId } from "@/lib/client/device/device-id";
import { isQrOrderEnforcedOnRequest } from "@/lib/shared/config/qr-order-env";
import { QR_ORDER_INACTIVITY_MESSAGE } from "@/lib/client/qr/qr-inactivity";
import { shouldExpireQrSessionForInactivity } from "@/lib/server/qr/qr-session-inactivity-policy";
import { isDeviceAuthorizedForQrAccess } from "@/lib/server/db/qr-access-bindings";
import { getQrOrderSessionFromRequest } from "@/lib/server/qr/qr-order-session";

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

function qrDeviceMismatchError(): Error & { status: number } {
  const err = new Error(
    "This order session is registered to another device."
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

function qrSessionInactiveError(): Error & { status: number } {
  const err = new Error(QR_ORDER_INACTIVITY_MESSAGE) as Error & {
    status: number;
  };
  err.status = 403;
  return err;
}

async function assertQrSessionForDevice(
  request: NextRequest,
  deviceId: string | null | undefined
): Promise<NonNullable<Awaited<ReturnType<typeof getQrOrderSessionFromRequest>>>> {
  const session = await getQrOrderSessionFromRequest(request);
  if (!session?.jti) {
    throw qrSessionRequiredError();
  }

  const normalizedDeviceId = normalizeDeviceId(deviceId);
  if (
    !normalizedDeviceId ||
    session.deviceId !== normalizedDeviceId ||
    !(await isDeviceAuthorizedForQrAccess(session.jti, normalizedDeviceId))
  ) {
    throw qrDeviceMismatchError();
  }

  if (
    await shouldExpireQrSessionForInactivity(session, normalizedDeviceId)
  ) {
    throw qrSessionInactiveError();
  }

  return session;
}

/**
 * Reject order creation unless a valid table-QR session cookie exists.
 * Dine-in table_number must match the table encoded in the QR session.
 */
export async function assertQrOrderAllowed(
  request: NextRequest,
  input: OrderCreateInput,
  deviceId?: string | null
): Promise<void> {
  if (!isQrOrderEnforcedOnRequest()) return;

  const session = await assertQrSessionForDevice(request, deviceId);

  const serviceType = input.service_type ?? "dine_in";
  if (serviceType === "dine_in") {
    const table = input.table_number?.trim();
    if (!table || table !== session.table) {
      throw qrTableMismatchError();
    }
  }
}

/** Dine-in: always use the table from the QR session cookie. */
export async function authorizedDineInTableNumber(
  request: NextRequest,
  clientTable: string | null | undefined,
  deviceId?: string | null
): Promise<string | null> {
  if (!isQrOrderEnforcedOnRequest()) {
    return clientTable?.trim() || null;
  }

  const session = await assertQrSessionForDevice(request, deviceId);

  const table = clientTable?.trim();
  if (!table || table !== session.table) {
    throw qrTableMismatchError();
  }

  return session.table;
}
