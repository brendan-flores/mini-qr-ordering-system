import type { Order, OrderStatus } from "@/client/services/orders";
import { orderStatusLabel } from "@/client/services/orders";
import { isOrderCancelled } from "@/lib/orders/order-rules";

/** Customer-facing kitchen steps (maps internal statuses). */
export const CUSTOMER_KITCHEN_STEPS = [
  { key: "received" as const, label: "Order received" },
  { key: "preparing" as const, label: "Preparing" },
  { key: "serving" as const, label: "Serving" },
  { key: "served" as const, label: "Served" },
  { key: "completed" as const, label: "Complete" },
] as const;

export type CustomerKitchenStepKey =
  (typeof CUSTOMER_KITCHEN_STEPS)[number]["key"];

const STEP_INDEX: Record<CustomerKitchenStepKey, number> = {
  received: 0,
  preparing: 1,
  serving: 2,
  served: 3,
  completed: 4,
};

export function shortOrderId(id: string | number) {
  return String(id).slice(0, 8).toUpperCase();
}

export function customerKitchenStepIndex(status: OrderStatus | undefined) {
  const s = status ?? "received";
  if (s === "cancelled") return -1;
  if (s in STEP_INDEX) return STEP_INDEX[s as CustomerKitchenStepKey];
  return 0;
}

export function customerKitchenStepLabel(status: OrderStatus | undefined) {
  if (isOrderCancelled({ order_status: status, payment_status: "Pending" })) {
    return "Cancelled";
  }
  return orderStatusLabel(status ?? "received");
}

export function confirmationHeadline(order: Order) {
  if (isOrderCancelled(order)) return "Order cancelled";
  if (order.payment_method === "gcash" && order.payment_status === "Paid") {
    return "Payment successful!";
  }
  if (order.payment_method === "cod") {
    return "Order sent to kitchen!";
  }
  return "Order confirmed!";
}

export function confirmationMessage(order: Order) {
  if (isOrderCancelled(order)) {
    return "This order was cancelled and will not be prepared.";
  }
  if (order.payment_method === "cod") {
    return "Pay with cash when staff serves your table or after you finish eating. Track progress below.";
  }
  if (order.payment_method === "gcash" && order.payment_status === "Paid") {
    return "Your GCash payment was received. We're preparing your order.";
  }
  return "We're getting your order ready.";
}
