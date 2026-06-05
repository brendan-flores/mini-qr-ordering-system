import { QR_BINDING_HEARTBEAT_STALE_SEC } from "@/lib/qr-inactivity";
import { isQrBindingInactive } from "@/lib/qr-binding-inactivity";

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
