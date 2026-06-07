import { getOrCreateDeviceId } from "@/lib/client/device/device-session";
import { clearOrderingActivity } from "@/lib/client/qr/ordering-activity";
import { clearOrderingSession, hasActiveQrBinding, hasTableFromQr } from "@/lib/client/session/table";

export {
  QR_ORDER_INACTIVITY_MESSAGE,
  QR_SESSION_TERMINATED_MESSAGE,
} from "@/lib/client/qr/qr-inactivity";

function logoutUrl(deviceId: string): string {
  return `/api/qr/logout?device_id=${encodeURIComponent(deviceId)}`;
}

/** Clear client-side ordering state only (does not release the server QR binding). */
export function clearLocalOrderingSession(): void {
  clearOrderingActivity();
  clearOrderingSession();
}

/** Remove table/access query params so a refresh cannot re-activate via URL alone. */
export function stripQrCredentialsFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const hadCredentials =
    url.searchParams.has("table") || url.searchParams.has("access");
  if (!hadCredentials) return;

  url.searchParams.delete("table");
  url.searchParams.delete("access");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, "", next);
}

/** Staff-terminated or invalid server session — clear state and scrub the QR URL. */
export function handleQrSessionTerminated(): void {
  clearLocalOrderingSession();
  stripQrCredentialsFromUrl();
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
 * another phone may scan the same printed QR. Used on tab/browser close,
 * leaving the ordering flow, inactivity timeout, and invalid session.
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
 * Best-effort logout when the tab or entire browser is closing.
 * sendBeacon + fetch(keepalive) for iPhone, Android, and desktop.
 */
export function releaseQrSessionOnUnload(): void {
  if (typeof window === "undefined") return;
  if (!hasActiveQrBinding() && !hasTableFromQr()) return;

  const deviceId = getOrCreateDeviceId();
  const url = deviceId ? logoutUrl(deviceId) : "/api/qr/logout";

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url);
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
