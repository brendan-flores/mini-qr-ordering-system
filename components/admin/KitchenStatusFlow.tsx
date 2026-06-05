"use client";

import type { AdminKitchenStatus } from "@/client/services/orders";
import { uiStaggerMs } from "@/lib/ui-motion";
import {
  kitchenStepState,
  type KitchenStepProgress,
} from "@/lib/kitchen-step-progress";
import { MaterialIcon } from "../ui/MaterialIcon";

export type KitchenFlowTab = {
  id: AdminKitchenStatus;
  label: string;
  count: number;
};

const STEP_ICONS: Partial<Record<AdminKitchenStatus, string>> = {
  received: "inbox",
  preparing: "skillet",
  serving: "delivery_dining",
  served: "restaurant",
  completed: "check_circle",
};

export function KitchenStatusFlow({
  tabs,
  active,
  onChange,
  kitchenProgress,
  ariaLabel = "Filter orders by kitchen status",
}: {
  tabs: KitchenFlowTab[];
  active: AdminKitchenStatus;
  onChange(status: AdminKitchenStatus): void;
  kitchenProgress?: KitchenStepProgress | null;
  ariaLabel?: string;
}) {
  const activeIndex = tabs.findIndex((t) => t.id === active);
  const trackPercent =
    tabs.length > 1 && activeIndex >= 0
      ? (activeIndex / (tabs.length - 1)) * 100
      : 0;

  return (
    <nav
      className="admin-animate-fade-in w-full border-b border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)]/40 px-3 py-4 sm:px-5 sm:py-5"
      aria-label={ariaLabel}
    >
      <ol
        className="relative grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        }}
        role="tablist"
      >
        {/* Pipeline track */}
        <div
          className="pointer-events-none absolute top-[1.65rem] right-[10%] left-[10%] hidden h-0.5 overflow-hidden rounded-full bg-[var(--color-surface-line)] sm:block sm:top-[1.85rem]"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-[var(--color-primary)]/25 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${trackPercent}%` }}
          />
        </div>

        {tabs.map((tab, index) => {
          const selected = active === tab.id;
          const step = kitchenProgress
            ? kitchenStepState(index, kitchenProgress)
            : undefined;
          const isDone = step === "done";
          const isProgressActive = step === "active";
          const hasOrders = tab.count > 0;
          const icon = STEP_ICONS[tab.id] ?? "circle";

          return (
            <li
              key={tab.id}
              className="admin-animate-fade-up relative min-w-0"
              style={{ animationDelay: uiStaggerMs(index) }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-current={isProgressActive ? "step" : undefined}
                onClick={() => onChange(tab.id)}
                className={[
                  "admin-transition-smooth flex w-full flex-col items-center gap-2 rounded-xl border px-1.5 py-3 sm:rounded-2xl sm:px-2 sm:py-3.5",
                  "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
                  selected
                    ? [
                        "border-[var(--color-primary)] bg-white shadow-[0_6px_20px_rgba(184,0,53,0.12)]",
                        "ring-1 ring-[var(--color-primary)]/15",
                      ].join(" ")
                    : isProgressActive
                      ? "border-[var(--color-primary)]/40 bg-white ring-2 ring-[var(--color-primary)]/20"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50/90 hover:border-emerald-300"
                        : [
                            "border-transparent bg-white/80 hover:border-[var(--color-surface-line)] hover:bg-white",
                            hasOrders ? "shadow-sm" : "",
                          ].join(" "),
                ].join(" ")}
              >
                <span
                  className={[
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
                    isDone
                      ? "bg-emerald-600 text-white shadow-sm"
                      : selected
                        ? "bg-[var(--color-primary)] text-white shadow-md"
                        : isProgressActive
                          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-2 ring-[var(--color-primary)]/30"
                          : hasOrders
                            ? "bg-[var(--color-primary-soft)]/80 text-[var(--color-primary-dark)]"
                            : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]",
                  ].join(" ")}
                  aria-hidden
                >
                  {isDone ? (
                    <MaterialIcon name="check" className="text-lg" />
                  ) : (
                    <MaterialIcon name={icon} className="text-lg sm:text-xl" />
                  )}
                </span>

                <span className="flex w-full min-w-0 flex-col items-center gap-1 px-0.5">
                  <span
                    className={[
                      "w-full text-center text-[11px] font-semibold leading-snug sm:text-xs",
                      selected
                        ? "text-[var(--color-primary-dark)]"
                        : isProgressActive
                          ? "text-[var(--color-primary)]"
                          : isDone
                            ? "text-emerald-900"
                            : "text-[var(--color-text-muted)]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </span>
                  <span
                    key={tab.count}
                    className={[
                      "admin-transition-smooth inline-flex min-w-[1.75rem] items-center justify-center rounded-md px-2 py-0.5 tabular-nums",
                      hasOrders ? "admin-animate-count-pop" : "",
                      selected
                        ? "bg-[var(--color-primary)] text-sm font-bold text-white"
                        : hasOrders
                          ? "bg-zinc-100 text-sm font-bold text-zinc-800"
                          : "bg-[var(--color-surface-subtle)] text-xs font-semibold text-[var(--color-text-muted)]/60",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
