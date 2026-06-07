"use client";

import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "@/types/order";
import { orderStatusLabel } from "@/lib/shared/orders/order-labels";
import {
  canMarkKitchenCompleted,
  effectivePaymentStatus,
  KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE,
} from "@/lib/shared/orders/order-rules";

const PAYMENT_OPTIONS: PaymentStatus[] = ["Pending", "Paid"];

const KITCHEN_OPTIONS: AdminKitchenStatus[] = [
  "received",
  "preparing",
  "serving",
  "served",
  "completed",
];

export function PaymentStatusSelect({
  value,
  disabled,
  onChange,
  className = "",
}: {
  value: Order["payment_status"];
  disabled?: boolean;
  onChange(status: PaymentStatus): void;
  className?: string;
}) {
  const displayValue = effectivePaymentStatus(value);

  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1 block text-[11px] font-medium text-[var(--color-text-muted)]">
        Payment
      </span>
      <select
        value={displayValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as PaymentStatus)}
        onClick={(e) => e.stopPropagation()}
        className="w-full cursor-pointer rounded-lg border border-[var(--color-surface-line)] bg-white px-2.5 py-2 text-sm font-medium text-zinc-900 outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {PAYMENT_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
  );
}

export function KitchenStatusSelect({
  value,
  paymentStatus,
  disabled,
  onChange,
  className = "",
}: {
  value: AdminKitchenStatus;
  paymentStatus: Order["payment_status"];
  disabled?: boolean;
  onChange(status: AdminKitchenStatus): void;
  className?: string;
}) {
  const allowCompleted = canMarkKitchenCompleted({ payment_status: paymentStatus });
  const options = KITCHEN_OPTIONS.filter(
    (status) =>
      status !== "completed" || allowCompleted || value === "completed"
  );
  const displayValue =
    disabled || allowCompleted || value !== "completed" ? value : "served";

  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1 block text-[11px] font-medium text-[var(--color-text-muted)]">
        Kitchen
      </span>
      <select
        value={displayValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AdminKitchenStatus)}
        onClick={(e) => e.stopPropagation()}
        className="w-full cursor-pointer rounded-lg border border-[var(--color-surface-line)] bg-white px-2.5 py-2 text-sm font-medium text-zinc-900 outline-none focus:border-[var(--color-primary)]/50 focus:ring-2 focus:ring-[var(--color-primary)]/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {orderStatusLabel(status)}
          </option>
        ))}
      </select>
      {!disabled &&
      !allowCompleted &&
      effectivePaymentStatus(paymentStatus) === "Pending" ? (
        <p className="mt-1 text-[10px] leading-snug text-[var(--color-text-muted)]">
          {KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE}
        </p>
      ) : null}
    </label>
  );
}
