import type { Product } from "./product";

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
