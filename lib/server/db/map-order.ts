import type { RowDataPacket } from "mysql2";
import type { OrderRecord } from "@/lib/server/services/order-service";

function parseItems(raw: unknown): OrderRecord["items"] {
  if (Array.isArray(raw)) return raw as OrderRecord["items"];
  if (typeof raw === "string") {
    return JSON.parse(raw) as OrderRecord["items"];
  }
  return [];
}

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

export function mapOrderRow(
  row: RowDataPacket,
  defaults?: {
    table_number?: string;
    service_type?: OrderRecord["service_type"];
  }
): OrderRecord {
  const service_type =
    (row.service_type as OrderRecord["service_type"] | undefined) ??
    defaults?.service_type ??
    "dine_in";
  const table_number =
    service_type === "takeout"
      ? null
      : ((row.table_number as string | null | undefined) ??
        defaults?.table_number ??
        "1");

  return {
    id: row.id as string | number,
    items: parseItems(row.items),
    total_amount: Number(row.total_amount),
    payment_method: row.payment_method as OrderRecord["payment_method"],
    payment_status: normalizePaymentStatus(
      row.payment_status as string | null | undefined
    ),
    table_number,
    service_type,
    order_status: normalizeOrderStatus(
      row.order_status as string | null | undefined
    ),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    client_device_id: (row.client_device_id as string | null) ?? null,
  };
}
