import { fetchOrdersFromHistory } from "@/lib/client/api/order-history-fetch";
import { orderNeedsStatusPolling } from "@/lib/shared/orders/order-rules";
import { touchOrderingActivity } from "@/lib/client/qr/ordering-activity";
import {
  isOrderingInactivitySuspended,
  setOrderingInactivitySuspended,
  subscribeToOrderingInactivitySuspend,
} from "@/lib/client/qr/ordering-inactivity-suspend-state";

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
