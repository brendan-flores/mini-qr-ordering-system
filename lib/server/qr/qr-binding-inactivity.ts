import { QR_ORDER_INACTIVITY_SEC } from "@/lib/client/qr/qr-inactivity";

export function isQrBindingInactive(
  lastActiveAt: string | Date | null | undefined
): boolean {
  if (!lastActiveAt) return true;

  const ts =
    lastActiveAt instanceof Date
      ? lastActiveAt.getTime()
      : new Date(lastActiveAt).getTime();

  if (!Number.isFinite(ts)) return true;

  return (Date.now() - ts) / 1000 > QR_ORDER_INACTIVITY_SEC;
}
