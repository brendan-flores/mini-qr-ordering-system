"use client";

import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "../../client/services/orders";
import { isOrderCancelled } from "../../lib/orders/order-rules";
import { formatMoney } from "../cart/cartUtils";
import { isOrderLocked, itemsSummary, orderLocationLabel } from "./adminUtils";
import { MaterialIcon } from "../ui/MaterialIcon";
import { KitchenStatusSelect, PaymentStatusSelect } from "./StatusSelect";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function kitchenSelectValue(
  status: Order["order_status"]
): AdminKitchenStatus {
  if (
    status === "preparing" ||
    status === "serving" ||
    status === "served" ||
    status === "completed"
  ) {
    return status;
  }
  return "received";
}

export function AdminOrderCard({
  order,
  updating,
  readOnly = false,
  onSelect,
  onPaymentChange,
  onKitchenChange,
}: {
  order: Order;
  updating: boolean;
  readOnly?: boolean;
  onSelect(): void;
  onPaymentChange(status: PaymentStatus): void;
  onKitchenChange(status: AdminKitchenStatus): void;
}) {
  const locationLabel = orderLocationLabel(order);
  const locked = readOnly || isOrderLocked(order) || isOrderCancelled(order);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <button
        type="button"
        onClick={onSelect}
        className="cursor-pointer p-4 text-left transition hover:bg-[var(--color-surface-subtle)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-[var(--color-primary)]">
              {locationLabel}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {formatTime(order.created_at)}
            </p>
          </div>
          <p className="text-lg font-bold text-zinc-900">
            {formatMoney(order.total_amount)}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-snug text-zinc-700">
          {itemsSummary(order)}
        </p>

        <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
          <MaterialIcon name="touch_app" filled={false} className="text-base" />
          Tap for full details
        </p>
      </button>

      <div
        className="grid grid-cols-2 gap-2 border-t border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)]/40 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <PaymentStatusSelect
          value={order.payment_status}
          disabled={updating || locked}
          onChange={onPaymentChange}
        />
        <KitchenStatusSelect
          value={kitchenSelectValue(order.order_status)}
          disabled={updating || locked}
          onChange={onKitchenChange}
        />
      </div>
    </article>
  );
}
