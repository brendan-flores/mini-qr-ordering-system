import type { Order } from "../../client/services/orders";

export function shortOrderId(id: string | number) {
  const s = String(id);
  return s.length > 8 ? `#${s.slice(0, 8)}` : `#${s}`;
}

export function itemsSummary(order: Order, maxItems = 3) {
  const parts = order.items.map((it) => `${it.quantity}x ${it.name}`);
  if (parts.length <= maxItems) return parts.join(", ");
  const shown = parts.slice(0, maxItems).join(", ");
  return `${shown}, +${parts.length - maxItems} more`;
}

export {
  canMarkKitchenCompleted,
  isOrderCancelled,
  isOrderLocked,
} from "../../lib/orders/order-rules";

export function orderLocationLabel(order: Order) {
  if (order.service_type === "takeout") return "Take out";
  const table = order.table_number?.trim();
  return table ? `Table ${table}` : "—";
}

