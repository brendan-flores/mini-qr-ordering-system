import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getErrorMessage,
  isMissingColumnError,
  missingColumnHint,
} from "./supabase-order-errors";
import {
  createMockOrder,
  getMockOrderById,
  listMockProducts,
  listMockOrders,
  updateMockOrderPaymentStatus,
  updateMockOrderStatus,
} from "../../services/mock-data.service.js";

export const ORDER_COLUMNS_FULL =
  "id,items,total_amount,payment_method,payment_status,table_number,service_type,order_status,created_at";

export const ORDER_COLUMNS_KITCHEN =
  "id,items,total_amount,payment_method,payment_status,table_number,order_status,created_at";

export const ORDER_COLUMNS_BASE =
  "id,items,total_amount,payment_method,payment_status,created_at";

const ORDER_SELECT_COLUMNS = [
  ORDER_COLUMNS_FULL,
  ORDER_COLUMNS_KITCHEN,
  ORDER_COLUMNS_BASE,
] as const;

async function selectWithColumnFallback<T>(
  run: (columns: string) => PromiseLike<{ data: unknown; error: unknown }>
): Promise<{ data: T; error: null } | { data: null; error: unknown }> {
  let lastError: unknown = null;
  for (const columns of ORDER_SELECT_COLUMNS) {
    const result = await run(columns);
    if (!result.error && result.data !== null) {
      return { data: result.data as T, error: null };
    }
    if (!result.error && result.data === null) {
      return { data: null as T, error: null };
    }
    lastError = result.error;
    if (!isMissingColumnError(result.error)) {
      return { data: null, error: result.error };
    }
  }
  return { data: null, error: lastError };
}

/** @deprecated use ORDER_COLUMNS_FULL */
export const ORDER_COLUMNS = ORDER_COLUMNS_FULL;

function normalizeOrderStatus(
  value: string | null | undefined
): OrderRecord["order_status"] {
  if (value === "ready") return "serving";
  if (
    value === "received" ||
    value === "preparing" ||
    value === "serving" ||
    value === "served" ||
    value === "completed" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "received";
}

function normalizePaymentStatus(
  value: string | null | undefined
): OrderRecord["payment_status"] {
  if (value === "Completed") return "Paid";
  if (value === "Pending" || value === "Paid" || value === "Failed") {
    return value;
  }
  return "Pending";
}

function withOrderDefaults(
  row: Record<string, unknown>,
  table_number?: string,
  service_type?: OrderRecord["service_type"]
): OrderRecord {
  const resolvedService =
    (row.service_type as OrderRecord["service_type"] | undefined) ??
    service_type ??
    "dine_in";
  const resolvedTable =
    resolvedService === "takeout"
      ? null
      : ((row.table_number as string | null | undefined) ??
        table_number ??
        "1");

  return {
    ...(row as OrderRecord),
    table_number: resolvedTable,
    service_type: resolvedService,
    payment_status: normalizePaymentStatus(
      row.payment_status as string | null | undefined
    ),
    order_status: normalizeOrderStatus(
      row.order_status as string | null | undefined
    ),
  };
}

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
};

type CreateInput = {
  items: OrderRecord["items"];
  total_amount: number;
  payment_method: "cod" | "gcash";
  payment_status: OrderRecord["payment_status"];
  table_number: string | null;
  service_type: OrderRecord["service_type"];
};

export async function validateAndBuildOrder(
  input: CreateInput
): Promise<{ items: OrderRecord["items"]; total_amount: number }> {
  const productMap = new Map<string, { name: string; price: number; image_url: string | null }>();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const ids = [...new Set(input.items.map((i) => String(i.product_id)))];
    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,image_url")
      .in("id", ids);
    if (error) throw error;
    for (const p of data ?? []) {
      productMap.set(String(p.id), {
        name: p.name,
        price: Number(p.price),
        image_url: p.image_url,
      });
    }
  } else {
    for (const p of listMockProducts()) {
      productMap.set(String(p.id), {
        name: p.name,
        price: Number(p.price),
        image_url: p.image_url ?? null,
      });
    }
  }

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

  if (!isSupabaseConfigured()) {
    return createMockOrder({
      items,
      total_amount,
      payment_method: input.payment_method,
      payment_status: input.payment_status,
      table_number:
        input.service_type === "takeout"
          ? undefined
          : (input.table_number ?? "1"),
      service_type: input.service_type,
      order_status: "received",
    }) as OrderRecord;
  }

  const supabase = getSupabaseAdmin();
  const baseRow = {
    items,
    total_amount,
    payment_method: input.payment_method,
    payment_status: input.payment_status,
  };
  const extendedRow = {
    ...baseRow,
    table_number: input.table_number,
    service_type: input.service_type,
    order_status: "received" as const,
  };

  let insertResult = await supabase
    .from("orders")
    .insert(extendedRow)
    .select(ORDER_COLUMNS_FULL)
    .single();

  if (insertResult.error && isMissingColumnError(insertResult.error)) {
    insertResult = await supabase
      .from("orders")
      .insert({ ...baseRow, table_number: input.table_number, order_status: "received" })
      .select(ORDER_COLUMNS_KITCHEN)
      .single();
  }
  if (insertResult.error && isMissingColumnError(insertResult.error)) {
    insertResult = await supabase
      .from("orders")
      .insert(baseRow)
      .select(ORDER_COLUMNS_BASE)
      .single();
  }

  if (insertResult.error) {
    const hint = missingColumnHint(insertResult.error);
    const err = new Error(hint ?? getErrorMessage(insertResult.error));
    if (!hint) (err as Error & { status: number }).status = 500;
    throw err;
  }

  return withOrderDefaults(
    insertResult.data as Record<string, unknown>,
    input.table_number ?? undefined,
    input.service_type
  );
}

export async function listAllOrders(): Promise<OrderRecord[]> {
  if (!isSupabaseConfigured()) {
    return listMockOrders() as OrderRecord[];
  }

  const supabase = getSupabaseAdmin();
  const listResult = await selectWithColumnFallback<Record<string, unknown>[]>(
    (columns) =>
      supabase
        .from("orders")
        .select(columns)
        .order("created_at", { ascending: false })
  );

  if (listResult.error) throw listResult.error;
  return (listResult.data ?? []).map((row) => withOrderDefaults(row));
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  if (!isSupabaseConfigured()) {
    return (getMockOrderById(id) as OrderRecord | null) ?? null;
  }

  const supabase = getSupabaseAdmin();
  const getResult = await selectWithColumnFallback<Record<string, unknown>>(
    (columns) => supabase.from("orders").select(columns).eq("id", id).maybeSingle()
  );

  if (getResult.error) throw getResult.error;
  if (!getResult.data) return null;
  return withOrderDefaults(getResult.data);
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

export async function cancelOrderByCustomer(id: string): Promise<OrderRecord> {
  const existing = await getOrderById(id);
  if (!existing) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  if (existing.order_status === "cancelled") {
    return existing;
  }
  if (
    existing.order_status === "completed" ||
    existing.order_status === "served"
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
  }

  if (!isSupabaseConfigured()) {
    return updateMockOrderStatus({ id, order_status }) as OrderRecord;
  }

  const supabase = getSupabaseAdmin();
  const statusPatch = await selectWithColumnFallback<Record<string, unknown>>(
    (columns) =>
      supabase
        .from("orders")
        .update({ order_status })
        .eq("id", id)
        .select(columns)
        .single()
  );

  if (statusPatch.error) {
    if (isMissingColumnError(statusPatch.error)) {
      const err = new Error(
        missingColumnHint(statusPatch.error) ??
          "order_status column is not available. Run supabase/patch-table-and-order-status.sql."
      );
      (err as Error & { status: number }).status = 400;
      throw err;
    }
    throw statusPatch.error;
  }
  if (!statusPatch.data) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return withOrderDefaults(statusPatch.data, undefined);
}

export async function patchOrderPayment(
  id: string,
  payment_status: OrderRecord["payment_status"]
): Promise<OrderRecord> {
  const existing = await getOrderById(id);
  assertOrderEditable(existing);

  if (!isSupabaseConfigured()) {
    return updateMockOrderPaymentStatus({
      id,
      payment_status,
    }) as OrderRecord;
  }

  const supabase = getSupabaseAdmin();
  const patchResult = await selectWithColumnFallback<Record<string, unknown>>(
    (columns) =>
      supabase
        .from("orders")
        .update({ payment_status })
        .eq("id", id)
        .select(columns)
        .single()
  );

  if (patchResult.error) throw patchResult.error;
  if (!patchResult.data) {
    const err = new Error("Order not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  return withOrderDefaults(patchResult.data);
}

export async function patchOrderStatus(
  id: string,
  order_status: OrderRecord["order_status"]
): Promise<OrderRecord> {
  return patchOrderStatusInternal(id, order_status);
}
