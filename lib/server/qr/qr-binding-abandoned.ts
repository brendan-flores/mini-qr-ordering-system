import { deviceHasAwaitingOrders } from "@/lib/server/db/device-awaiting-orders";
import { QR_BINDING_HEARTBEAT_STALE_SEC } from "@/lib/client/qr/qr-inactivity";
import { isQrBindingInactive } from "@/lib/server/qr/qr-binding-inactivity";

function isQrBindingHeartbeatStale(
  lastActiveAt: string | Date | null | undefined
): boolean {
  if (!lastActiveAt) return true;

  const ts =
    lastActiveAt instanceof Date
      ? lastActiveAt.getTime()
      : new Date(lastActiveAt).getTime();

  if (!Number.isFinite(ts)) return true;

  return (Date.now() - ts) / 1000 > QR_BINDING_HEARTBEAT_STALE_SEC;
}

/** Binding is gone if the guest is idle (2 min) or heartbeats stopped (tab killed). */
export function isQrBindingAbandoned(
  lastActiveAt: string | Date | null | undefined
): boolean {
  return (
    isQrBindingHeartbeatStale(lastActiveAt) ||
    isQrBindingInactive(lastActiveAt)
  );
}

/**
 * Tab/browser close still abandons via heartbeat stale (~45s).
 * Two-minute idle is waived while the guest waits on a checked-out order.
 */
export async function isQrBindingAbandonedForDevice(
  lastActiveAt: string | Date | null | undefined,
  deviceId: string,
  tableNumber: string
): Promise<boolean> {
  if (isQrBindingHeartbeatStale(lastActiveAt)) return true;
  if (!isQrBindingInactive(lastActiveAt)) return false;
  const awaiting = await deviceHasAwaitingOrders(deviceId, tableNumber);
  return !awaiting;
}
