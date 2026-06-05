import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  clearOrderingActivity,
  QR_ORDER_INACTIVITY_MESSAGE,
} from "@/lib/ordering-activity";
import { logQrSession } from "@/lib/qr-session-log";
import {
  clearOrderingSession,
  getStoredQrAccessToken,
  hasActiveQrBinding,
  hasTableFromQr,
} from "@/lib/table";

export { QR_ORDER_INACTIVITY_MESSAGE };

function buildLogoutUrl(deviceId: string): string {
  const params = new URLSearchParams();
  params.set("device_id", deviceId);

  const access = getStoredQrAccessToken();
  if (access) params.set("access", access);

  return `/api/qr/logout?${params}`;
}

function absoluteLogoutUrl(deviceId: string): string {
  if (typeof window === "undefined") return buildLogoutUrl(deviceId);
  return new URL(buildLogoutUrl(deviceId), window.location.origin).href;
}

/** Clear client-side ordering state only (does not release the server QR binding). */
export function clearLocalOrderingSession(): void {
  clearOrderingActivity();
  clearOrderingSession();
}

async function notifyServerQrLogout(options?: { beacon?: boolean }): Promise<void> {
  const deviceId = getOrCreateDeviceId();
  if (!deviceId) {
    logQrSession("logout_skipped_no_device");
    return;
  }

  const url = absoluteLogoutUrl(deviceId);
  logQrSession("logout_request", { beacon: Boolean(options?.beacon), deviceId });

  if (
    options?.beacon &&
    typeof navigator !== "undefined" &&
    navigator.sendBeacon
  ) {
    const sent = navigator.sendBeacon(url, new FormData());
    logQrSession("logout_beacon", { sent, deviceId });
    if (sent) return;
  }

  try {
    await fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });
  } catch {
    logQrSession("logout_fetch_failed", { deviceId });
  }
}

/**
 * End the table-QR ordering session and release the server device binding so
 * another phone may scan the same printed QR.
 */
export async function endQrOrderingSession(options?: {
  /** Use sendBeacon for tab close / page unload (best-effort). */
  beacon?: boolean;
}): Promise<void> {
  clearLocalOrderingSession();
  await notifyServerQrLogout(options);
}

export async function endOrderingSessionDueToInactivity(): Promise<void> {
  logQrSession("logout_inactivity");
  await endQrOrderingSession();
}

/**
 * Best-effort logout when the tab or entire browser is closing.
 * Uses sendBeacon (POST) plus fetch keepalive. Includes the stored access
 * token so Android browsers that drop cookies on unload can still release
 * the binding.
 */
export function releaseQrSessionOnUnload(): void {
  if (typeof window === "undefined") return;
  if (!hasActiveQrBinding() && !hasTableFromQr()) return;

  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return;

  const url = absoluteLogoutUrl(deviceId);
  logQrSession("unload_release", { deviceId, hasAccess: Boolean(getStoredQrAccessToken()) });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new FormData());
  }

  try {
    void fetch(url, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
