import type { Order } from "@/client/services/orders";

type OrderLike = Pick<Order, "payment_status" | "order_status">;

export function isOrderCancelled(order: OrderLike) {
  return (order.order_status ?? "received") === "cancelled";
}

export function isKitchenCompleted(order: OrderLike) {
  return order.order_status === "completed";
}

/** Kitchen completed or customer-cancelled — no admin edits. */
export function isOrderLocked(order: OrderLike) {
  return isKitchenCompleted(order) || isOrderCancelled(order);
}

export function effectivePaymentStatus(
  payment_status: Order["payment_status"]
): "Pending" | "Paid" | "Failed" {
  if (payment_status === "Completed") return "Paid";
  return payment_status;
}

/** Still in progress — worth polling for admin/kitchen updates. */
export function orderNeedsStatusPolling(order: OrderLike) {
  if (isOrderCancelled(order)) return false;
  if (isKitchenCompleted(order)) return false;
  if (order.payment_status === "Failed") return false;
  return true;
}

export function canCustomerCancel(order: OrderLike) {
  if (isOrderCancelled(order) || isKitchenCompleted(order)) return false;
  const kitchen = order.order_status ?? "received";
  if (kitchen === "served") return false;
  if (order.payment_status === "Failed") return false;
  return true;
}
