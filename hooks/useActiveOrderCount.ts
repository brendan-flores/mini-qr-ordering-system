"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrdersFromHistory } from "@/lib/client/api/order-history-fetch";
import { orderNeedsStatusPolling } from "@/lib/shared/orders/order-rules";
import { subscribeToOrderUpdates } from "@/lib/client/orders/order-events";
import { LIVE_ORDER_POLL_MS } from "@/lib/shared/orders/order-polling";

/** In-progress orders on this device (for nav badge). */
export function useActiveOrderCount(enabled = true) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      return;
    }
    try {
      const orders = await fetchOrdersFromHistory();
      setCount(orders.filter(orderNeedsStatusPolling).length);
    } catch {
      setCount(0);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const unsub = subscribeToOrderUpdates(() => {
      void refresh();
    });
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, LIVE_ORDER_POLL_MS);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [refresh, enabled]);

  return count;
}
