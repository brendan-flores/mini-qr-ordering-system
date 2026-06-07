import { adminApiFetch, apiFetch } from "./api";
import { getOrCreateDeviceId } from "@/lib/client/device/device-session";

export type {
  PaymentMethod,
  PaymentStatus,
  PaymentStatusLegacy,
  OrderStatus,
  AdminKitchenStatus,
  ServiceType,
  OrderItem,
  Order,
  CreateOrderPayload,
} from "@/types/order";

import type {
  AdminKitchenStatus,
  CreateOrderPayload,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ServiceType,
} from "@/types/order";

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
  return adminApiFetch<{ data: Order[] }>("/api/admin/orders");
}

export async function updateOrderPaymentStatus(
  id: Order["id"],
  payment_status: PaymentStatus
) {
  return adminApiFetch<{ data: Order }>(`/api/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status }),
  });
}

export async function updateOrderStatus(
  id: Order["id"],
  order_status: AdminKitchenStatus
) {
  return adminApiFetch<{ data: Order }>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ order_status }),
  });
}

export {
  paymentMethodLabel,
  serviceTypeLabel,
  orderStatusLabel,
} from "@/lib/shared/orders/order-labels";

export async function cancelOrder(id: Order["id"]) {
  return apiFetch<{ data: Order }>(`/api/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ device_id: getOrCreateDeviceId() }),
  });
}
