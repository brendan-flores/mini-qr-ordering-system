"use client";

import type { PaymentTab } from "./PaymentStatusTabs";

const TAB_HINT: Record<PaymentTab, string> = {
  Pending: "Awaiting payment",
  Paid: "In kitchen workflow",
  Completed: "Paid & served",
  Cancelled: "Cancelled orders",
};

export function LiveOrdersHeader({ activeTab }: { activeTab: PaymentTab }) {
  return (
    <header className="px-4 py-3.5 sm:px-5 sm:py-4">
      <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
        Live Orders
      </h1>
      <p className="mt-1 text-[11px] text-[var(--color-text-muted)] sm:mt-1.5 sm:text-xs">
        <span className="font-medium text-[var(--color-primary)]">{activeTab}</span>
        <span className="mx-1.5 text-[var(--color-text-muted)]/35">—</span>
        {TAB_HINT[activeTab]}
      </p>
    </header>
  );
}
