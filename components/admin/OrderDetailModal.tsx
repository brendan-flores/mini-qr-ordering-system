"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  orderStatusLabel,
  paymentMethodLabel,
  serviceTypeLabel,
  type AdminKitchenStatus,
  type Order,
  type PaymentStatus,
} from "@/lib/client/api/orders";
import { isOrderCancelled } from "@/lib/shared/orders/order-rules";
import { formatMoney } from "@/lib/client/cart/cart-utils";
import { MaterialIcon } from "../ui/MaterialIcon";
import { isOrderLocked, orderLocationLabel, shortOrderId } from "@/lib/client/admin/admin-utils";
import { AdminKitchenProgress } from "./AdminKitchenProgress";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { KitchenStatusSelect, PaymentStatusSelect } from "./StatusSelect";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
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

export function OrderDetailModal({
  order,
  updating,
  readOnly = false,
  onClose,
  onPaymentChange,
  onKitchenChange,
}: {
  order: Order;
  updating: boolean;
  readOnly?: boolean;
  onClose(): void;
  onPaymentChange(status: PaymentStatus): void;
  onKitchenChange(status: AdminKitchenStatus): void;
}) {
  const locationLabel = orderLocationLabel(order);
  const locked = readOnly || isOrderLocked(order) || isOrderCancelled(order);
  const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="admin-animate-modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="admin-animate-modal-panel flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-surface-line)] px-5 py-4">
          <div>
            <h2
              id="order-detail-title"
              className="text-xl font-bold text-[var(--color-primary)]"
            >
              {locationLabel}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Order {shortOrderId(order.id)} · {formatDateTime(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Close"
          >
            <MaterialIcon name="close" filled={false} />
          </button>
        </div>

        <div className="admin-animate-fade-in min-h-0 flex-1 overflow-y-auto px-5 py-4" style={{ animationDelay: "60ms" }}>
          <PaymentMethodBadge
            method={order.payment_method ?? "cod"}
            serviceType={order.service_type}
          />

          {isOrderCancelled(order) ? (
            <p className="mt-4 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-700">
              Cancelled by customer
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
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
          )}
          {locked && !isOrderCancelled(order) ? (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Kitchen is {orderStatusLabel(order.order_status ?? "received")} —
              this order cannot be changed.
            </p>
          ) : null}

          {!isOrderCancelled(order) ? (
            <div
              className="admin-animate-fade-up mt-5 w-full min-w-0"
              style={{ animationDelay: "120ms" }}
            >
              <AdminKitchenProgress order={order} />
            </div>
          ) : null}

          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            {serviceTypeLabel(order.service_type ?? "dine_in")}
            {" · "}
            {paymentMethodLabel(
              order.payment_method,
              order.service_type ?? "dine_in"
            )}
          </p>

          <p className="mt-2 text-2xl font-extrabold text-zinc-900">
            {formatMoney(order.total_amount)}
          </p>

          <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Items ({itemCount})
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <li
                key={`${String(item.product_id)}-${idx}`}
                className="flex gap-3 rounded-xl border border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)]/50 p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-primary)]">
                      <MaterialIcon name="restaurant" className="text-2xl" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.quantity} × {formatMoney(item.price)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
