"use client";

import { useEffect, useRef } from "react";
import { subscribeToOrderUpdates } from "@/lib/order-events";
import { LIVE_ORDER_POLL_MS } from "@/lib/order-polling";

export function useLiveOrderSync(
  onSync: () => void,
  options: {
    enabled?: boolean;
    /** Recreate subscription when this changes (e.g. order id list). */
    scopeKey?: string;
  }
) {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const enabled = options.enabled !== false;
  const scopeKey = options.scopeKey ?? "static";

  useEffect(() => {
    if (!enabled) return;

    const run = () => onSyncRef.current();
    const unsubLocal = subscribeToOrderUpdates(run);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, LIVE_ORDER_POLL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") run();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubLocal();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, scopeKey]);
}
