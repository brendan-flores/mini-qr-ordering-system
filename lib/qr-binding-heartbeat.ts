/** Server expects a heartbeat at least this often while a tab is open. */
export const QR_BINDING_HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * If no heartbeat for this long, the binding is treated as abandoned (tab closed,
 * browser killed, or failed unload). A new device may take over on the next scan.
 */
export const QR_BINDING_HEARTBEAT_STALE_SEC = 45;

export function isQrBindingHeartbeatStale(
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
