import {
  updateOrderPaymentStatus,
  type Order,
  type PaymentStatus,
} from "./orders";
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

export function resolvePendingOrder(orders: Order[]): Order | null {
  const stored = getStoredOrder();
  if (stored?.payment_status === "Pending") {
    const match = orders.find((o) => String(o.id) === String(stored.id));
    return match ?? stored;
  }
  return (
    orders.find(
      (o) =>
        o.payment_method === "gcash" &&
        (o.payment_status === "Pending" || o.payment_status === "Failed")
    ) ?? null
  );
}

/** Retry GCash mock payment on an existing pending/failed order */
export async function payOrder(
  orderId: Order["id"],
  payment_status: Extract<PaymentStatus, "Paid" | "Failed">
) {
  const { data } = await updateOrderPaymentStatus(orderId, payment_status);
  saveStoredOrder(data);
  return data;
}
