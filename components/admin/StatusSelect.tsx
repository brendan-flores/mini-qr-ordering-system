"use client";

import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "../../client/services/orders";
import { orderStatusLabel } from "../../client/services/orders";
import { effectivePaymentStatus } from "../../lib/orders/order-rules";

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
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        Payment
      </span>
      <select
        value={displayValue}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as PaymentStatus)}
        onClick={(e) => e.stopPropagation()}
        className="w-full cursor-pointer rounded-lg border border-[var(--color-surface-line)] bg-white px-2.5 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
  disabled,
  onChange,
  className = "",
}: {
  value: AdminKitchenStatus;
  disabled?: boolean;
  onChange(status: AdminKitchenStatus): void;
  className?: string;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        Kitchen
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AdminKitchenStatus)}
        onClick={(e) => e.stopPropagation()}
        className="w-full cursor-pointer rounded-lg border border-[var(--color-surface-line)] bg-white px-2.5 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {KITCHEN_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {orderStatusLabel(status)}
          </option>
        ))}
      </select>
    </label>
  );
}
