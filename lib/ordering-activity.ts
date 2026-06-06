import { isOrderingInactivitySuspended } from "@/lib/ordering-inactivity-suspend-state";
import { QR_ORDER_INACTIVITY_MS } from "@/lib/qr-inactivity";
import { hasTableFromQr, isQrOrderEnforcedOnClient } from "@/lib/table";

const LAST_ACTIVITY_KEY = "brencravings-ordering-last-activity";

export function touchOrderingActivity() {
  if (typeof window === "undefined") return;
  if (!isQrOrderEnforcedOnClient() || !hasTableFromQr()) return;
  window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function clearOrderingActivity() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function isClientOrderingInactive(): boolean {
  if (typeof window === "undefined") return false;
  if (!isQrOrderEnforcedOnClient() || !hasTableFromQr()) return false;
  if (isOrderingInactivitySuspended()) return false;

  const raw = window.sessionStorage.getItem(LAST_ACTIVITY_KEY);
  if (!raw) return true;

  const last = Number(raw);
  if (!Number.isFinite(last)) return true;

  return Date.now() - last > QR_ORDER_INACTIVITY_MS;
}
