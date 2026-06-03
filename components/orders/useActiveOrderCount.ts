"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrdersFromHistory } from "@/client/services/order-history-fetch";
import { orderNeedsStatusPolling } from "@/lib/orders/order-rules";
import { ORDER_UPDATED_EVENT } from "@/lib/order-events";

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
    function onUpdate() {
      void refresh();
    }
    window.addEventListener(ORDER_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(ORDER_UPDATED_EVENT, onUpdate);
  }, [refresh, enabled]);

  return count;
}
