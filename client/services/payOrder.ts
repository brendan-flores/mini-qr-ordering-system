import { updateOrderPaymentStatus, type Order } from "./orders";

export function getStoredOrder(): Order | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("lastOrder");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export function saveStoredOrder(order: Order) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lastOrder", JSON.stringify(order));
  window.dispatchEvent(new Event("order-updated"));
}

export function resolvePendingOrder(orders: Order[]): Order | null {
  const stored = getStoredOrder();
  if (stored?.payment_status === "Pending") {
    const match = orders.find((o) => String(o.id) === String(stored.id));
    return match ?? stored;
  }
  return orders.find((o) => o.payment_status === "Pending") ?? null;
}

/** Mock payment: ~70% success rate */
export async function payOrder(orderId: Order["id"]) {
  const success = Math.random() >= 0.3;
  const payment_status: Order["payment_status"] = success ? "Paid" : "Failed";
  const { data } = await updateOrderPaymentStatus(orderId, payment_status);
  saveStoredOrder(data);
  return data;
}
