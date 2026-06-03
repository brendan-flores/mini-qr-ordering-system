/** Polling when Supabase Realtime is not configured. */
export const LIVE_ORDER_POLL_MS = 5_000;

/** Safety-net poll when Realtime is active (websocket reconnect gaps). */
export const LIVE_ORDER_BACKUP_POLL_MS = 60_000;
