import type { Order } from "./orders";
import { rememberOrderId } from "./order-history";
import { notifyOrderUpdated } from "../../lib/order-events";

const LAST_ORDER_KEY = "brencravings-last-order";

export function getStoredOrder(): Order | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Order;
    return {
      ...parsed,
      payment_method: parsed.payment_method ?? "cod",
    };
  } catch {
    return null;
  }
}

export function saveStoredOrder(
  order: Order,
  options?: { notify?: boolean }
) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(order);
  const prev = window.sessionStorage.getItem(LAST_ORDER_KEY);
  const changed = prev !== serialized;
  window.sessionStorage.setItem(LAST_ORDER_KEY, serialized);
  rememberOrderId(order.id);
  const shouldNotify = options?.notify !== false && changed;
  if (shouldNotify) {
    notifyOrderUpdated();
  }
}
