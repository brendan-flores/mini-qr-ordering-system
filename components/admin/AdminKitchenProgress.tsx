"use client";

import type { Order, OrderStatus } from "@/lib/client/api/orders";
import { uiStaggerMs } from "@/lib/shared/utils/ui-motion";
import { orderStatusLabel } from "@/lib/client/api/orders";
import { CUSTOMER_KITCHEN_STEPS } from "@/lib/shared/orders/customer-order-flow";
import {
  getKitchenStepProgress,
  kitchenStepState,
} from "@/lib/shared/orders/kitchen-step-progress";
import { isOrderCancelled } from "@/lib/shared/orders/order-rules";
import { MaterialIcon } from "../ui/MaterialIcon";

const STEP_ICONS: Partial<Record<OrderStatus, string>> = {
  received: "inbox",
  preparing: "skillet",
  serving: "delivery_dining",
  served: "restaurant",
  completed: "check_circle",
};

function adminStepLabel(key: OrderStatus) {
  if (key === "received") return "Order received";
  return orderStatusLabel(key);
}

function stepStatusCaption(state: "done" | "active" | "upcoming") {
  if (state === "done") return "Done";
  if (state === "active") return "In progress";
  return "Up next";
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
  const totalSteps = CUSTOMER_KITCHEN_STEPS.length;
  const currentIndex = Math.max(progress.currentStepIndex, 0);
  const currentLabel = adminStepLabel(
    CUSTOMER_KITCHEN_STEPS[currentIndex]!.key
  );

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-gradient-to-br from-white via-white to-[var(--color-surface-subtle)]/80 shadow-[0_4px_20px_rgba(18,28,42,0.06)]"
      aria-label="Kitchen order progress"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-surface-line)]/80 bg-[var(--color-primary-soft)]/25 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            Kitchen progress
          </p>
          <p className="mt-1 truncate text-sm font-bold text-[var(--foreground)] sm:text-base">
            {currentLabel}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--color-primary)]/15 bg-white px-2.5 py-1 text-[11px] font-bold tabular-nums text-[var(--color-primary)] shadow-sm">
          {currentIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="px-4 py-4">
        {/* Mobile: vertical timeline — avoids cramped 2-col overlap */}
        <ol
          className={[
            "flex flex-col",
            isCompact ? "" : "sm:hidden",
          ].join(" ")}
        >
          {CUSTOMER_KITCHEN_STEPS.map((step, index) => {
            const state = kitchenStepState(index, progress);
            const isLast = index === CUSTOMER_KITCHEN_STEPS.length - 1;
            const icon = STEP_ICONS[step.key] ?? "circle";

            return (
              <li
                key={step.key}
                className="admin-animate-fade-up relative flex gap-3"
                style={{ animationDelay: uiStaggerMs(index, 35) }}
                aria-current={state === "active" ? "step" : undefined}
              >
                <div className="flex w-8 shrink-0 flex-col items-center">
                  <span
                    className={[
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                      state === "done"
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                        : state === "active"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(184,0,53,0.28)]"
                          : "border-[var(--color-surface-line)] bg-white text-[var(--color-text-muted)]",
                    ].join(" ")}
                    aria-hidden
                  >
                    {state === "done" ? (
                      <MaterialIcon name="check" className="text-base" />
                    ) : state === "active" ? (
                      <MaterialIcon name={icon} className="text-base" />
                    ) : (
                      <span className="text-[11px]">{index + 1}</span>
                    )}
                  </span>
                  {!isLast ? (
                    <span
                      className={[
                        "my-1 w-0.5 flex-1 min-h-[1.25rem] rounded-full",
                        state === "done"
                          ? "bg-emerald-400"
                          : "bg-[var(--color-surface-line)]",
                      ].join(" ")}
                      aria-hidden
                    />
                  ) : null}
                </div>

                <div
                  className={[
                    "mb-3 min-w-0 flex-1 rounded-xl border px-3 py-2.5",
                    state === "active"
                      ? "border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)]/50 shadow-sm"
                      : state === "done"
                        ? "border-emerald-100 bg-emerald-50/70"
                        : "border-[var(--color-surface-line)]/80 bg-white/80",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={[
                        "text-sm font-semibold leading-snug",
                        state === "active"
                          ? "text-[var(--color-primary-dark)]"
                          : state === "done"
                            ? "text-emerald-900"
                            : "text-[var(--color-text-muted)]",
                      ].join(" ")}
                    >
                      {adminStepLabel(step.key)}
                    </p>
                    <span
                      className={[
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        state === "active"
                          ? "bg-[var(--color-primary)] text-white"
                          : state === "done"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]/70",
                      ].join(" ")}
                    >
                      {stepStatusCaption(state)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Desktop / compact: horizontal steps */}
        <ol
          className={[
            "grid gap-2",
            isCompact
              ? "grid-cols-1"
              : "hidden sm:grid sm:grid-cols-5",
          ].join(" ")}
        >
          {CUSTOMER_KITCHEN_STEPS.map((step, index) => {
            const state = kitchenStepState(index, progress);
            const icon = STEP_ICONS[step.key] ?? "circle";

            return (
              <li
                key={step.key}
                className={[
                  "admin-transition-smooth admin-animate-fade-up flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center",
                  state === "done"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : state === "active"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-zinc-900 ring-1 ring-[var(--color-primary)]/25"
                      : "border-[var(--color-surface-line)] bg-white text-zinc-500",
                ].join(" ")}
                style={{ animationDelay: uiStaggerMs(index, 40) }}
                aria-current={state === "active" ? "step" : undefined}
              >
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    state === "done"
                      ? "bg-emerald-600 text-white"
                      : state === "active"
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : "bg-zinc-100 text-zinc-500",
                  ].join(" ")}
                  aria-hidden
                >
                  {state === "done" ? (
                    <MaterialIcon name="check" className="text-lg" />
                  ) : state === "active" ? (
                    <MaterialIcon name={icon} className="text-lg" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={[
                    "w-full text-[11px] font-semibold leading-tight",
                    state === "active" ? "text-[var(--color-primary)]" : "",
                  ].join(" ")}
                >
                  {adminStepLabel(step.key)}
                </span>
              </li>
            );
          })}
        </ol>

        <div
          className={[
            "mt-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:mt-4",
            progress.activeStepIndex >= 0
              ? "border-[var(--color-primary)]/15 bg-[var(--color-primary-soft)]/35"
              : "border-emerald-200 bg-emerald-50",
          ].join(" ")}
        >
          <MaterialIcon
            name={
              progress.activeStepIndex >= 0
                ? "arrow_forward"
                : "check_circle"
            }
            className={[
              "shrink-0 text-lg",
              progress.activeStepIndex >= 0
                ? "text-[var(--color-primary)]"
                : "text-emerald-600",
            ].join(" ")}
          />
          {progress.activeStepIndex >= 0 ? (
            <p className="min-w-0 text-xs leading-snug text-[var(--foreground)] sm:text-sm">
              <span className="font-semibold text-[var(--color-primary-dark)]">
                Up next:
              </span>{" "}
              {adminStepLabel(
                CUSTOMER_KITCHEN_STEPS[progress.activeStepIndex]!.key
              )}
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-800 sm:text-sm">
              All kitchen steps complete.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
