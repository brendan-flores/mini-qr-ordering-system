import { apiFetch } from "./api";
import type { Product } from "./products";

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
  payment_status: "Pending" | "Paid" | "Failed";
  created_at: string;
};

export async function createOrder(payload: {
  items: OrderItem[];
  total_amount: number;
}) {
  return apiFetch<{ data: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listOrders() {
  return apiFetch<{ data: Order[] }>("/api/orders");
}

export async function updateOrderPaymentStatus(
  id: Order["id"],
  payment_status: Order["payment_status"]
) {
  return apiFetch<{ data: Order }>(`/api/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status }),
  });
}

