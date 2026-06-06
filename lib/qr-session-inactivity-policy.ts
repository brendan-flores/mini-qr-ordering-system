import type { QrOrderSessionPayload } from "@/lib/qr-order-session";
import { isQrSessionInactive } from "@/lib/qr-inactivity";
import { deviceHasAwaitingOrders } from "@/lib/mysql/device-awaiting-orders";

/**
 * End session for inactivity only before checkout or after kitchen marks Completed.
 * While an order is in progress, the guest may wait without interacting.
 */
export async function shouldExpireQrSessionForInactivity(
  session: QrOrderSessionPayload,
  deviceId: string | null | undefined
): Promise<boolean> {
  if (!isQrSessionInactive(session.lastActive)) return false;
  if (!deviceId?.trim()) return true;

  const awaiting = await deviceHasAwaitingOrders(deviceId, session.table);
  return !awaiting;
}
