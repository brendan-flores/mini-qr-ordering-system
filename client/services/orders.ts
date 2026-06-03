import { apiFetch } from "./api";
import { getOrCreateDeviceId } from "@/lib/device-session";
import type { Product } from "./products";

export type PaymentMethod = "cod" | "gcash";

export type PaymentStatus = "Pending" | "Paid" | "Failed";

/** Legacy rows may still return Completed until DB migration runs. */
export type PaymentStatusLegacy = PaymentStatus | "Completed";

export type OrderStatus =
  | "received"
  | "preparing"
  | "serving"
  | "served"
  | "completed"
  | "cancelled";

export type AdminKitchenStatus = Exclude<OrderStatus, "cancelled">;

export type ServiceType = "dine_in" | "takeout";

export type OrderItem = {
  product_id: Product["id"];
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
};

export type Order = {
  id: string | number;
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatusLegacy;
  table_number?: string | null;
  service_type?: ServiceType;
  order_status?: OrderStatus;
  created_at: string;
};

export type CreateOrderPayload = {
  items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  table_number?: string;
  service_type?: ServiceType;
};

export async function createOrder(payload: CreateOrderPayload) {
  const device_id = getOrCreateDeviceId();
  const body =
    payload.payment_method === "cod"
      ? { ...payload, payment_status: "Pending" as const, device_id }
      : { ...payload, device_id };

  return apiFetch<{ data: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getOrder(id: Order["id"]) {
  const device_id = getOrCreateDeviceId();
  const q = device_id
    ? `?device_id=${encodeURIComponent(device_id)}`
    : "";
  return apiFetch<{ data: Order }>(`/api/orders/${id}${q}`);
}

/** One request for all stored order ids on this device (used on Your Orders). */
export async function getOrdersByIds(ids: Order["id"][]) {
  if (ids.length === 0) {
    return { data: [] as Order[] };
  }
  const device_id = getOrCreateDeviceId();
  return apiFetch<{ data: Order[] }>("/api/orders/history", {
    method: "POST",
    body: JSON.stringify({ ids: ids.map(String), device_id }),
  });
}

export async function listAdminOrders() {
  return apiFetch<{ data: Order[] }>("/api/admin/orders");
}

export async function updateOrderPaymentStatus(
  id: Order["id"],
  payment_status: PaymentStatus
) {
  return apiFetch<{ data: Order }>(`/api/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status }),
  });
}

export async function updateOrderStatus(
  id: Order["id"],
  order_status: AdminKitchenStatus
) {
  return apiFetch<{ data: Order }>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ order_status }),
  });
}

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

export async function cancelOrder(id: Order["id"]) {
  return apiFetch<{ data: Order }>(`/api/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ device_id: getOrCreateDeviceId() }),
  });
}
