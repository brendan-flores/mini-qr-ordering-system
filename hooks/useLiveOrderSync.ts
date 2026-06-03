"use client";

import { useEffect, useRef } from "react";
import { subscribeToOrderUpdates } from "@/lib/order-events";
import {
  LIVE_ORDER_BACKUP_POLL_MS,
  LIVE_ORDER_POLL_MS,
} from "@/lib/order-polling";
import { isSupabaseRealtimeConfigured } from "@/lib/supabase/browser";
import {
  subscribeOrdersRealtime,
  type OrdersRealtimeScope,
} from "@/lib/supabase/orders-realtime";

export function useLiveOrderSync(
  onSync: () => void,
  options: {
    enabled?: boolean;
    scope: OrdersRealtimeScope;
    /** Recreate Realtime subscription when this changes (e.g. order id list). */
    scopeKey?: string;
  }
) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const scopeRef = useRef(options.scope);
  scopeRef.current = options.scope;

  const enabled = options.enabled !== false;
  const scopeKey = options.scopeKey ?? "static";

  useEffect(() => {
    if (!enabled) return;

    const run = () => onSyncRef.current();
    const unsubLocal = subscribeToOrderUpdates(run);

    const unsubRealtime = isSupabaseRealtimeConfigured()
      ? subscribeOrdersRealtime({
          scope: scopeRef.current,
          onChange: run,
        })
      : () => {};

    const pollMs = isSupabaseRealtimeConfigured()
      ? LIVE_ORDER_BACKUP_POLL_MS
      : LIVE_ORDER_POLL_MS;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, pollMs);

    function onVisible() {
      if (document.visibilityState === "visible") run();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubLocal();
      unsubRealtime();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, scopeKey]);
}
