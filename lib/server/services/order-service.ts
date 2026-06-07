import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import {
  canMarkKitchenCompleted,
  KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE,
} from "@/lib/shared/orders/order-rules";
import { mapOrderRow } from "@/lib/server/db/map-order";
import { query } from "@/lib/server/db/db";
import { getProductsByIds } from "@/lib/server/db/products";
import { getErrorMessage } from "./db-errors";

export type OrderRecord = {
  id: string | number;
  items: Array<{
    product_id: string | number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
  }>;
  total_amount: number;
  payment_method: "cod" | "gcash";
  payment_status: "Pending" | "Paid" | "Failed";
  table_number: string | null;
  service_type: "dine_in" | "takeout";
  order_status:
    | "received"
    | "preparing"
    | "serving"
    | "served"
    | "completed"
    | "cancelled";
  created_at: string;
  client_device_id?: string | null;
};

type CreateInput = {
  items: OrderRecord["items"];
  total_amount: number;
  payment_method: "cod" | "gcash";
  payment_status: OrderRecord["payment_status"];
  table_number: string | null;
  service_type: OrderRecord["service_type"];
  client_device_id?: string | null;
};

const ORDER_SELECT = `id, items, total_amount, payment_method, payment_status,
  table_number, service_type, order_status, created_at, client_device_id`;

/** Customer may only access orders created on this device (when tagged). */
export function assertOrderOwnedByDevice(
  order: OrderRecord,
  deviceId: string | null | undefined
) {
  const owner = order.client_device_id;
  if (!owner) return;
  if (!deviceId || owner !== deviceId) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
}

export async function listOrdersForDeviceHistory(
  ids: string[],
  deviceId: string
): Promise<OrderRecord[]> {
  if (ids.length === 0) return [];
  const idSet = new Set(ids.map(String));
  const all = await listAllOrders();
  return all.filter((order) => {
    if (!idSet.has(String(order.id))) return false;
    if (!order.client_device_id) return true;
    return order.client_device_id === deviceId;
  });
}

export async function validateAndBuildOrder(
  input: CreateInput
): Promise<{ items: OrderRecord["items"]; total_amount: number }> {
  const ids = [...new Set(input.items.map((i) => String(i.product_id)))];
  const products = await getProductsByIds(ids);
  const productMap = new Map(
    products.map((p) => [
      String(p.id),
      { name: p.name, price: p.price, image_url: p.image_url },
    ])
  );

  const validatedItems: OrderRecord["items"] = [];
  let computedTotal = 0;

  for (const item of input.items) {
    const product = productMap.get(String(item.product_id));
    if (!product) {
      const err = new Error(`Product not found: ${item.product_id}`);
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    const lineTotal = product.price * item.quantity;
    computedTotal += lineTotal;
    validatedItems.push({
      product_id: item.product_id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image_url: product.image_url,
    });
  }

  const rounded = Math.round(computedTotal * 100) / 100;
  const submitted = Math.round(input.total_amount * 100) / 100;
  if (Math.abs(rounded - submitted) > 0.02) {
    const err = new Error(
      `Total mismatch: expected ${rounded}, received ${submitted}`
    );
    (err as Error & { status: number }).status = 400;
    throw err;
  }

  return { items: validatedItems, total_amount: rounded };
}

export async function createOrderRecord(
  input: CreateInput
): Promise<OrderRecord> {
  const { items, total_amount } = await validateAndBuildOrder(input);
  const id = randomUUID();

  await query(
    `INSERT INTO orders (
      id, items, total_amount, payment_method, payment_status,
      table_number, service_type, order_status, client_device_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'received', ?)`,
    [
      id,
      JSON.stringify(items),
      total_amount,
      input.payment_method,
      input.payment_status,
      input.table_number,
      input.service_type,
      input.client_device_id ?? null,
    ]
  );

  const created = await getOrderById(id);
  if (!created) {
    throw new Error(getErrorMessage(new Error("Failed to load created order")));
  }
  return created;
}

export async function listAllOrders(): Promise<OrderRecord[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT ${ORDER_SELECT} FROM orders ORDER BY created_at DESC`
  );
  return rows.map((row) => mapOrderRow(row));
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT ${ORDER_SELECT} FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return mapOrderRow(row);
}

function assertOrderEditable(existing: OrderRecord | null): asserts existing is OrderRecord {
  if (!existing) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (
    existing.order_status === "completed" ||
    existing.order_status === "cancelled"
  ) {
    const err = new Error("This order cannot be modified");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

export async function cancelOrderByCustomer(
  id: string,
  deviceId?: string | null
): Promise<OrderRecord> {
  const existing = await getOrderById(id);
  if (!existing) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  assertOrderOwnedByDevice(existing, deviceId);
  if (existing.order_status === "cancelled") {
    return existing;
  }
  if (
    existing.order_status === "completed" ||
    existing.order_status === "served" ||
    existing.order_status === "serving" ||
    existing.order_status === "preparing"
  ) {
    const err = new Error("This order can no longer be cancelled");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  if (existing.payment_status === "Failed") {
    const err = new Error("Failed orders cannot be cancelled");
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  return patchOrderStatusInternal(id, "cancelled", { skipEditableCheck: true });
}

async function patchOrderStatusInternal(
  id: string,
  order_status: OrderRecord["order_status"],
  options?: { skipEditableCheck?: boolean }
): Promise<OrderRecord> {
  if (!options?.skipEditableCheck) {
    const existing = await getOrderById(id);
    assertOrderEditable(existing);
    if (order_status === "cancelled") {
      const err = new Error(
        "Cancelled status is set when the customer cancels an order"
      );
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    if (order_status === "completed" && !canMarkKitchenCompleted(existing)) {
      const err = new Error(KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE);
      (err as Error & { status: number }).status = 403;
      throw err;
    }
  }

  await query(`UPDATE orders SET order_status = ? WHERE id = ?`, [
    order_status,
    id,
  ]);

  const updated = await getOrderById(id);
  if (!updated) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return updated;
}

export async function patchOrderPayment(
  id: string,
  payment_status: OrderRecord["payment_status"]
): Promise<OrderRecord> {
  const existing = await getOrderById(id);
  assertOrderEditable(existing);

  await query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [
    payment_status,
    id,
  ]);

  const updated = await getOrderById(id);
  if (!updated) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return updated;
}

export async function patchOrderStatus(
  id: string,
  order_status: OrderRecord["order_status"]
): Promise<OrderRecord> {
  return patchOrderStatusInternal(id, order_status);
}
