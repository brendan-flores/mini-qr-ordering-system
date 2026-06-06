import { fetchOrdersFromHistory } from "@/client/services/order-history-fetch";
import { orderNeedsStatusPolling } from "@/lib/orders/order-rules";
import { touchOrderingActivity } from "@/lib/ordering-activity";
import {
  isOrderingInactivitySuspended,
  setOrderingInactivitySuspended,
  subscribeToOrderingInactivitySuspend,
} from "@/lib/ordering-inactivity-suspend-state";

export {
  isOrderingInactivitySuspended,
  subscribeToOrderingInactivitySuspend,
};

export async function refreshOrderingInactivitySuspend(): Promise<boolean> {
  try {
    const orders = await fetchOrdersFromHistory();
    const next = orders.some(orderNeedsStatusPolling);
    const changed = setOrderingInactivitySuspended(next);
    if (changed && !next) {
      touchOrderingActivity();
    }
    return next;
  } catch {
    const changed = setOrderingInactivitySuspended(false);
    if (changed) {
      touchOrderingActivity();
    }
    return false;
  }
}
