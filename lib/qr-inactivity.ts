/** End QR ordering session after this many minutes without user activity. */
export const QR_ORDER_INACTIVITY_MINUTES = 2;

export const QR_ORDER_INACTIVITY_SEC = QR_ORDER_INACTIVITY_MINUTES * 60;

export const QR_ORDER_INACTIVITY_MS = QR_ORDER_INACTIVITY_SEC * 1000;

export const QR_ORDER_INACTIVITY_MESSAGE =
  "Your ordering session ended after 2 minutes of inactivity. Scan your table QR code again to order.";

export function isQrSessionInactive(lastActive: number | undefined): boolean {
  if (typeof lastActive !== "number") return true;
  return (
    Math.floor(Date.now() / 1000) - lastActive > QR_ORDER_INACTIVITY_SEC
  );
}
