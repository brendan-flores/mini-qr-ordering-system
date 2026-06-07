"use client";

import type { OrderStatus } from "@/lib/client/api/orders";
import { CUSTOMER_KITCHEN_STEPS } from "@/lib/shared/orders/customer-order-flow";
import {
  getKitchenStepProgress,
  kitchenStepState,
} from "@/lib/shared/orders/kitchen-step-progress";
import { isOrderCancelled } from "@/lib/shared/orders/order-rules";
import { MaterialIcon } from "../ui/MaterialIcon";

export function OrderStatusStepper({
  orderStatus,
  compact = false,
}: {
  orderStatus?: OrderStatus;
  compact?: boolean;
}) {
  const cancelled = isOrderCancelled({
    order_status: orderStatus,
    payment_status: "Pending",
  });
  const progress = getKitchenStepProgress(orderStatus);

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700">
        <MaterialIcon name="cancel" className="text-lg text-zinc-500" />
        This order was cancelled.
      </div>
    );
  }

  return (
    <ol
      className={[
        "grid gap-2",
        compact ? "grid-cols-1" : "sm:grid-cols-5",
      ].join(" ")}
      aria-label="Order progress"
    >
      {CUSTOMER_KITCHEN_STEPS.map((step, index) => {
        const state = kitchenStepState(index, progress);
        return (
          <li
            key={step.key}
            className={[
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left",
              state === "done"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : state === "active"
                  ? "border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] text-zinc-900"
                  : "border-[var(--color-surface-line)] bg-white text-zinc-500",
            ].join(" ")}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                state === "done"
                  ? "bg-emerald-600 text-white"
                  : state === "active"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-zinc-200 text-zinc-600",
              ].join(" ")}
              aria-hidden
            >
              {state === "done" ? (
                <MaterialIcon name="check" className="text-base" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={[
                "text-xs font-semibold leading-tight",
                state === "active" ? "text-[var(--color-primary)]" : "",
              ].join(" ")}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
