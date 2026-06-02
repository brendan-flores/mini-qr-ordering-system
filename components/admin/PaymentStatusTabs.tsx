"use client";

export type PaymentTab = "Pending" | "Paid" | "Cancelled";

type TabConfig = {
  id: PaymentTab;
  label: string;
  count: number;
};

export function PaymentStatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabConfig[];
  active: PaymentTab;
  onChange(tab: PaymentTab): void;
}) {
  return (
    <div
      className="grid w-full grid-cols-3 gap-1.5 rounded-2xl border border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)] p-1.5"
      role="tablist"
      aria-label="Filter orders by payment status"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={[
              "flex min-w-0 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold transition sm:px-4 sm:py-3",
              selected
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "border border-[var(--color-surface-line)] bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span
              className={[
                "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold",
                selected
                  ? "bg-white/25 text-white"
                  : "bg-[var(--color-primary)] text-white",
              ].join(" ")}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
