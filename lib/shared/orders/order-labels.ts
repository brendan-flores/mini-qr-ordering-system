import type {
  OrderStatus,
  PaymentMethod,
  ServiceType,
} from "@/types/order";

export function paymentMethodLabel(
  method: PaymentMethod,
  serviceType: ServiceType = "dine_in"
) {
  if (method === "gcash") return "GCash";
  return serviceType === "takeout"
    ? "Pay at the counter (cash)"
    : "Pay at table (cash)";
}

export function serviceTypeLabel(type: ServiceType) {
  return type === "takeout" ? "Take out" : "Dine in";
}

export function orderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    received: "Received",
    preparing: "Preparing",
    serving: "Serving",
    served: "Served",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}
