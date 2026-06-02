"use client";

import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "../../client/services/orders";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminOrderCard } from "./AdminOrderCard";
import { orderGroupKey } from "./adminUtils";

function compareTableKeys(a: string, b: string) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
}

export function groupOrdersByTable(orders: Order[]): Map<string, Order[]> {
  const map = new Map<string, Order[]>();
  for (const order of orders) {
    const table = orderGroupKey(order);
    const list = map.get(table) ?? [];
    list.push(order);
    map.set(table, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  return map;
}

export function sortedTableKeys(map: Map<string, Order[]>): string[] {
  return [...map.keys()].sort(compareTableKeys);
}

export function TableOrdersSection({
  orders,
  updatingId,
  readOnly = false,
  onSelectOrder,
  onPaymentChange,
  onKitchenChange,
}: {
  orders: Order[];
  updatingId: string | null;
  readOnly?: boolean;
  onSelectOrder(order: Order): void;
  onPaymentChange(order: Order, status: PaymentStatus): void;
  onKitchenChange(order: Order, status: AdminKitchenStatus): void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <header className="flex items-center gap-2 border-b border-[var(--color-surface-line)] bg-gradient-to-r from-[var(--color-primary-soft)]/40 to-white px-4 py-3 sm:px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
          <MaterialIcon name="receipt_long" filled={false} className="text-xl" />
        </span>
        <p className="text-sm font-semibold text-zinc-800">
          {orders.length}{" "}
          {orders.length === 1 ? "order" : "orders"} in this group
        </p>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
        {orders.map((order) => {
          const id = String(order.id);
          const updating =
            updatingId === id ||
            updatingId === `kitchen-${id}` ||
            updatingId === `payment-${id}`;
          return (
            <AdminOrderCard
              key={id}
              order={order}
              updating={updating}
              readOnly={readOnly}
              onSelect={() => onSelectOrder(order)}
              onPaymentChange={(status) => onPaymentChange(order, status)}
              onKitchenChange={(status) => onKitchenChange(order, status)}
            />
          );
        })}
      </div>
    </section>
  );
}
