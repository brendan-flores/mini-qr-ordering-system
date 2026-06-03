"use client";

import {
  kitchenStepState,
  type KitchenStepProgress,
} from "@/lib/kitchen-step-progress";
import { MaterialIcon } from "../ui/MaterialIcon";
import type { StatusTone } from "./adminStatusStyles";

export type FilterTabConfig<T extends string> = {
  id: T;
  label: string;
  count: number;
};

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  variant = "payment",
  getTone,
  gridClassName = "grid-cols-2 sm:grid-cols-4",
  fullWidth = false,
  kitchenColumnCount = 4,
  kitchenProgress,
}: {
  tabs: FilterTabConfig<T>[];
  active: T;
  onChange(tab: T): void;
  ariaLabel: string;
  variant?: "payment" | "kitchen";
  getTone: (id: T) => StatusTone;
  gridClassName?: string;
  fullWidth?: boolean;
  kitchenColumnCount?: number;
  /** When set, kitchen tabs show checked/active progress for the selected order. */
  kitchenProgress?: KitchenStepProgress | null;
}) {
  const isKitchen = variant === "kitchen";
  const kitchenGrid =
    kitchenColumnCount === 4
      ? "grid grid-cols-2 sm:grid-cols-4"
      : "grid grid-cols-2 sm:grid-cols-5";

  const shell = isKitchen ? (
    <div
      className={[
        "w-full border-b border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)]",
        fullWidth
          ? kitchenGrid
          : "flex gap-1 overflow-x-auto rounded-xl border border-[var(--color-surface-line)] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      ].join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab, index) => (
        <TabButton
          key={tab.id}
          tab={tab}
          selected={active === tab.id}
          tone={getTone(tab.id)}
          variant={variant}
          fullWidth={fullWidth}
          isLast={index === tabs.length - 1}
          kitchenStep={
            kitchenProgress
              ? kitchenStepState(index, kitchenProgress)
              : undefined
          }
          onSelect={() => onChange(tab.id)}
        />
      ))}
    </div>
  ) : (
    <div
      className={["grid w-full gap-1", gridClassName].join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          selected={active === tab.id}
          tone={getTone(tab.id)}
          variant={variant}
          onSelect={() => onChange(tab.id)}
        />
      ))}
    </div>
  );

  return shell;
}

function TabButton<T extends string>({
  tab,
  selected,
  tone,
  variant,
  fullWidth = false,
  isLast = false,
  kitchenStep,
  onSelect,
}: {
  tab: FilterTabConfig<T>;
  selected: boolean;
  tone: StatusTone;
  variant: "payment" | "kitchen";
  fullWidth?: boolean;
  isLast?: boolean;
  kitchenStep?: "done" | "active" | "upcoming";
  onSelect(): void;
}) {
  const isKitchen = variant === "kitchen";
  const progressDone = kitchenStep === "done";
  const progressActive = kitchenStep === "active";

  if (isKitchen) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={selected}
        aria-current={progressActive ? "step" : undefined}
        onClick={onSelect}
        className={[
          "flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-1 transition",
          fullWidth
            ? "border-r border-[var(--color-surface-line)] px-1.5 py-2.5 sm:px-3 sm:py-3.5"
            : "min-w-[5.5rem] shrink-0 rounded-lg px-2.5 py-2",
          fullWidth && isLast ? "border-r-0" : "",
          progressActive && !selected
            ? "bg-[var(--color-primary-soft)] ring-1 ring-[var(--color-primary)]/30"
            : "",
          selected
            ? fullWidth
              ? [
                  tone.activeBg,
                  tone.activeText,
                  "ring-1 ring-inset",
                  tone.activeRing,
                  "border-b-2 border-[var(--color-primary)]",
                ].join(" ")
              : [tone.activeBg, tone.activeText, "ring-1", tone.activeRing].join(
                  " "
                )
            : progressDone
              ? "text-emerald-800"
              : ["text-[var(--color-text-muted)]", tone.inactiveHover].join(" "),
        ].join(" ")}
      >
        <span className="flex w-full min-w-0 items-center justify-center gap-1.5">
          {progressDone ? (
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
              aria-hidden
            >
              <MaterialIcon name="check" className="text-[10px]" />
            </span>
          ) : (
            <span
              className={[
                "h-1.5 w-1.5 shrink-0 rounded-full",
                progressActive ? "bg-[var(--color-primary)]" : tone.dot,
              ].join(" ")}
            />
          )}
          <span
            className={[
              "truncate text-xs font-medium sm:text-sm",
              selected || progressActive ? "font-semibold" : "",
              progressActive ? "text-[var(--color-primary)]" : "",
            ].join(" ")}
          >
            {tab.label}
          </span>
        </span>
        <span
          className={[
            "tabular-nums leading-none",
            selected
              ? "text-xs font-semibold sm:text-sm"
              : "text-[11px] font-medium text-[var(--color-text-muted)]/65",
          ].join(" ")}
        >
          {tab.count}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={[
        "flex min-w-0 flex-col items-stretch gap-0.5 rounded-lg border px-2.5 py-2 text-left transition sm:gap-1 sm:px-3 sm:py-2.5",
        selected
          ? [
              tone.activeBg,
              tone.activeText,
              "border-transparent ring-1",
              tone.activeRing,
            ].join(" ")
          : [
              "border-[var(--color-surface-line)]/60 bg-white text-[var(--color-text-muted)]",
              tone.inactiveHover,
            ].join(" "),
      ].join(" ")}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={[
            "h-1.5 w-1.5 shrink-0 rounded-full",
            tone.dot,
            selected ? "" : "opacity-70",
          ].join(" ")}
        />
        <span
          className={[
            "truncate text-xs font-medium sm:text-sm",
            selected ? "font-semibold" : "",
          ].join(" ")}
        >
          {tab.label}
        </span>
      </span>
      <span
        className={[
          "pl-3 tabular-nums leading-none sm:pl-3.5",
          selected
            ? "text-sm font-semibold sm:text-base"
            : "text-xs font-medium text-[var(--color-text-muted)]/70",
        ].join(" ")}
      >
        {tab.count}
      </span>
    </button>
  );
}
