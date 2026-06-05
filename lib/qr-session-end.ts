import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  clearOrderingActivity,
  QR_ORDER_INACTIVITY_MESSAGE,
} from "@/lib/ordering-activity";
import { clearOrderingSession, hasActiveQrBinding, hasTableFromQr } from "@/lib/table";

export { QR_ORDER_INACTIVITY_MESSAGE };

function logoutUrl(deviceId: string): string {
  return `/api/qr/logout?device_id=${encodeURIComponent(deviceId)}`;
}

/** Clear client-side ordering state only (does not release the server QR binding). */
export function clearLocalOrderingSession(): void {
  clearOrderingActivity();
  clearOrderingSession();
}

async function notifyServerQrLogout(options?: { beacon?: boolean }): Promise<void> {
  const deviceId = getOrCreateDeviceId();
  const url = deviceId ? logoutUrl(deviceId) : "/api/qr/logout";

  if (
    options?.beacon &&
    typeof navigator !== "undefined" &&
    navigator.sendBeacon
  ) {
    navigator.sendBeacon(url);
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * End the table-QR ordering session and release the server device binding so
 * another phone may scan the same printed QR. Used on tab/browser close, bare
 * menu visit, leaving checkout/orders, inactivity timeout, and invalid session.
 * Checkout ↔ orders navigation keeps the session until the guest returns to
 * bare menu or leaves the flow.
 */
export async function endQrOrderingSession(options?: {
  /** Use sendBeacon for tab close / page unload (best-effort). */
  beacon?: boolean;
}): Promise<void> {
  clearLocalOrderingSession();
  await notifyServerQrLogout(options);
}

export async function endOrderingSessionDueToInactivity(): Promise<void> {
  await endQrOrderingSession();
}

/**
 * Best-effort logout when the tab or entire browser is closing. Uses
 * fetch(keepalive) so cookies are sent reliably; does not clear local state
 * before the request (the page is unloading).
 */
export function releaseQrSessionOnUnload(): void {
  if (typeof window === "undefined") return;
  if (!hasActiveQrBinding() && !hasTableFromQr()) return;

  const deviceId = getOrCreateDeviceId();
  const url = deviceId ? logoutUrl(deviceId) : "/api/qr/logout";

  try {
    void fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });
  } catch {
    /* ignore */
  }

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
  }
}
