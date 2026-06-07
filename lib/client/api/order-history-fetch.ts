import { getOrdersByIds, type Order } from "./orders";
import { forgetOrderId, getStoredOrderIds } from "./order-history";
import { getStoredOrder, saveStoredOrder } from "./pay-order";

export async function fetchOrdersFromHistory(): Promise<Order[]> {
  const ids = getStoredOrderIds();
  if (ids.length === 0) return [];

  const { data } = await getOrdersByIds(ids);
  const foundIds = new Set(data.map((o) => String(o.id)));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    for (const id of missing) {
      forgetOrderId(id);
    }
  }

  const valid = [...data].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const stored = getStoredOrder();
  if (stored) {
    const match = valid.find((o) => String(o.id) === String(stored.id));
    // Sync lastOrder without notifying — avoids refresh ↔ fetch loops in OrdersList.
    if (match) saveStoredOrder(match, { notify: false });
  }

  return valid;
}
