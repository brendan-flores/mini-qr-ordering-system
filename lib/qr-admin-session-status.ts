/** Admin dashboard: show Idle badge after this many seconds without heartbeat. */
export const QR_ADMIN_SESSION_IDLE_SEC = 10;

function lastActiveTimestamp(
  lastActiveAt: string | Date | null | undefined
): number | null {
  if (!lastActiveAt) return null;

  const ts =
    lastActiveAt instanceof Date
      ? lastActiveAt.getTime()
      : new Date(lastActiveAt).getTime();

  return Number.isFinite(ts) ? ts : null;
}

function lastActiveAgeSec(
  lastActiveAt: string | Date | null | undefined
): number {
  const ts = lastActiveTimestamp(lastActiveAt);
  if (ts === null) return Number.POSITIVE_INFINITY;
  return (Date.now() - ts) / 1000;
}

/** Admin Active badge only — does not terminate the session. */
export function isQrBindingActiveForAdminDisplay(
  lastActiveAt: string | Date | null | undefined
): boolean {
  return lastActiveAgeSec(lastActiveAt) <= QR_ADMIN_SESSION_IDLE_SEC;
}
