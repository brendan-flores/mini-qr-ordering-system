import type { Order } from "@/types/order";

type OrderLike = Pick<Order, "payment_status" | "order_status">;

export function isOrderCancelled(order: OrderLike) {
  return (order.order_status ?? "received") === "cancelled";
}

export function isKitchenCompleted(order: OrderLike) {
  return order.order_status === "completed";
}

export function isPaymentPaid(order: OrderLike) {
  return effectivePaymentStatus(order.payment_status) === "Paid";
}

export const KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE =
  "Payment must be Paid before marking this order completed.";

/** Kitchen → completed only when payment is settled (Paid). */
export function canMarkKitchenCompleted(order: OrderLike) {
  return isPaymentPaid(order);
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

export type AdminPaymentTab =
  | "Pending"
  | "Paid"
  | "Completed"
  | "Cancelled";

export function matchesAdminPaymentTab(
  order: OrderLike,
  tab: AdminPaymentTab
): boolean {
  if (tab === "Cancelled") return isOrderCancelled(order);
  if (isOrderCancelled(order)) return false;

  const payment = effectivePaymentStatus(order.payment_status);

  if (tab === "Completed") {
    return payment === "Paid" && isKitchenCompleted(order);
  }

  if (tab === "Paid") {
    return payment === "Paid" && !isKitchenCompleted(order);
  }

  return payment === "Pending";
}

/** Customer may cancel only before kitchen starts preparing. */
export function canCustomerCancel(order: OrderLike) {
  if (isOrderCancelled(order) || isKitchenCompleted(order)) return false;
  if (order.payment_status === "Failed") return false;
  const kitchen = order.order_status ?? "received";
  return kitchen === "received";
}

/** Show cancel control on tracking UI (disabled when kitchen has started). */
export function showCustomerCancelButton(order: OrderLike) {
  if (isOrderCancelled(order) || isKitchenCompleted(order)) return false;
  if (order.payment_status === "Failed") return false;
  const kitchen = order.order_status ?? "received";
  return (
    kitchen === "received" ||
    kitchen === "preparing" ||
    kitchen === "serving" ||
    kitchen === "served"
  );
}
