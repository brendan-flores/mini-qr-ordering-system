"use client";

import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "@/types/order";
import {
  effectivePaymentStatus,
  isOrderCancelled,
} from "@/lib/shared/orders/order-rules";
import { formatMoney } from "@/lib/client/cart/cart-utils";
import {
  isOrderLocked,
  itemsSummary,
  orderLocationLabel,
  shortOrderId,
} from "@/lib/client/admin/admin-utils";
import { MaterialIcon } from "../ui/MaterialIcon";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  FAILED_PAYMENT_BADGE,
  PAYMENT_BADGE_STYLES,
} from "./adminStatusStyles";
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

function PaymentBadge({ status }: { status: Order["payment_status"] }) {
  const label = effectivePaymentStatus(status);
  if (label === "Failed") {
    return (
      <span
        className={[
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
          FAILED_PAYMENT_BADGE,
        ].join(" ")}
      >
        Failed
      </span>
    );
  }
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
        PAYMENT_BADGE_STYLES[label],
      ].join(" ")}
    >
      {label}
    </span>
  );
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
  const locked = readOnly || isOrderLocked(order) || isOrderCancelled(order);
  const kitchenStatus = order.order_status ?? "received";
  const locationLabel = orderLocationLabel(order);

  return (
    <article className="admin-transition-smooth flex flex-col overflow-hidden rounded-lg border border-[var(--color-surface-line)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 sm:rounded-xl">
      <button
        type="button"
        onClick={onSelect}
        className="admin-transition-smooth cursor-pointer p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]/40 sm:p-3.5"
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--color-primary)] sm:text-base">
              {locationLabel}
            </p>
            <p className="text-[10px] font-medium text-[var(--color-text-muted)] sm:text-[11px]">
              {shortOrderId(order.id)}
            </p>
          </div>
          <p className="shrink-0 text-base font-bold tabular-nums tracking-tight text-[var(--foreground)] sm:text-lg">
            {formatMoney(order.total_amount)}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-2.5 sm:gap-1.5">
          <PaymentBadge status={order.payment_status} />
          <OrderStatusBadge status={kitchenStatus} />
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 sm:mt-3 sm:text-sm">
          {itemsSummary(order)}
        </p>

        <p className="mt-2 text-[10px] text-[var(--color-text-muted)] sm:mt-2.5 sm:text-xs">
          {formatTime(order.created_at)}
        </p>
      </button>

      <div
        className="grid grid-cols-2 gap-2 border-t border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)]/50 px-2.5 py-2.5 sm:gap-3 sm:px-3 sm:py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <PaymentStatusSelect
          value={order.payment_status}
          disabled={updating || locked}
          onChange={onPaymentChange}
        />
        <KitchenStatusSelect
          value={kitchenSelectValue(order.order_status)}
          paymentStatus={order.payment_status}
          disabled={updating || locked}
          onChange={onKitchenChange}
        />
      </div>

      {!locked ? (
        <p className="flex items-center justify-center gap-1 border-t border-[var(--color-surface-line)]/80 py-2 text-[10px] font-medium text-[var(--color-text-muted)]">
          <MaterialIcon name="open_in_full" filled={false} className="text-sm opacity-60" />
          Tap card for details
        </p>
      ) : null}
    </article>
  );
}
