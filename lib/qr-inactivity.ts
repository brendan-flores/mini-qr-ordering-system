/** End QR ordering session after this many minutes without user activity. */
export const QR_ORDER_INACTIVITY_MINUTES = 2;

export const QR_ORDER_INACTIVITY_SEC = QR_ORDER_INACTIVITY_MINUTES * 60;

export const QR_ORDER_INACTIVITY_MS = QR_ORDER_INACTIVITY_SEC * 1000;

/** Min interval between activity heartbeats sent to the server while the user is interacting. */
export const QR_ACTIVITY_PING_THROTTLE_MS = 15_000;

/** How often the client checks whether the 2-minute inactivity window has elapsed. */
export const QR_INACTIVITY_CHECK_INTERVAL_MS = 10_000;

/**
 * Server-side: if no heartbeat updates `last_active_at` for this long, the binding
 * is treated as abandoned (tab/browser closed without a successful unload logout).
 * Shorter than the user inactivity window so stuck bindings clear quickly.
 */
export const QR_BINDING_HEARTBEAT_STALE_SEC = 45;

export const QR_ORDER_INACTIVITY_MESSAGE =
  "Your ordering session ended after 2 minutes of inactivity. Scan your table QR code again to order.";

export const QR_SESSION_TERMINATED_MESSAGE =
  "Your table ordering session was ended by staff. Scan the QR code again to order.";

export function isQrSessionInactive(lastActive: number | undefined): boolean {
  if (typeof lastActive !== "number") return true;
  return (
    Math.floor(Date.now() / 1000) - lastActive > QR_ORDER_INACTIVITY_SEC
  );
}
