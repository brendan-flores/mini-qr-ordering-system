"use client";

import type { Order, OrderStatus } from "@/client/services/orders";
import { adminStaggerMs } from "@/lib/admin-motion";
import { orderStatusLabel } from "@/client/services/orders";
import { CUSTOMER_KITCHEN_STEPS } from "@/lib/customer-order-flow";
import {
  getKitchenStepProgress,
  kitchenStepState,
} from "@/lib/kitchen-step-progress";
import { isOrderCancelled } from "@/lib/orders/order-rules";
import { MaterialIcon } from "../ui/MaterialIcon";

function adminStepLabel(key: OrderStatus) {
  if (key === "received") return "Order received";
  return orderStatusLabel(key);
}

export function AdminKitchenProgress({
  order,
  variant = "timeline",
}: {
  order: Pick<Order, "order_status" | "payment_status">;
  variant?: "timeline" | "compact";
}) {
  if (isOrderCancelled(order)) {
    return (
      <p className="rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700">
        Kitchen workflow stopped — order cancelled.
      </p>
    );
  }

  const progress = getKitchenStepProgress(order.order_status);
  const isCompact = variant === "compact";

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        Kitchen progress
      </p>
      <ol
        className={[
          "grid gap-2",
          isCompact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-5",
        ].join(" ")}
        aria-label="Kitchen order progress"
      >
        {CUSTOMER_KITCHEN_STEPS.map((step, index) => {
          const state = kitchenStepState(index, progress);
          return (
            <li
              key={step.key}
              className={[
                "admin-transition-smooth admin-animate-fade-up flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left",
                state === "done"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : state === "active"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-zinc-900 ring-1 ring-[var(--color-primary)]/25"
                    : "border-[var(--color-surface-line)] bg-white text-zinc-500",
              ].join(" ")}
              style={{ animationDelay: adminStaggerMs(index, 40) }}
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
                  "min-w-0 text-xs font-semibold leading-tight",
                  state === "active" ? "text-[var(--color-primary)]" : "",
                ].join(" ")}
              >
                {adminStepLabel(step.key)}
              </span>
            </li>
          );
        })}
      </ol>
      {progress.activeStepIndex >= 0 ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Next: {adminStepLabel(CUSTOMER_KITCHEN_STEPS[progress.activeStepIndex]!.key)}
        </p>
      ) : (
        <p className="mt-2 text-xs font-medium text-emerald-800">
          All kitchen steps complete.
        </p>
      )}
    </div>
  );
}
