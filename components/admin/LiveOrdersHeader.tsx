"use client";

import type { ReactNode } from "react";
import type { PaymentTab } from "./PaymentStatusTabs";

const TAB_HINT: Record<PaymentTab, string> = {
  Pending: "Awaiting payment",
  Paid: "In kitchen workflow",
  Completed: "Paid & served",
  Cancelled: "Cancelled orders",
};

export function LiveOrdersHeader({
  activeTab,
  trailing,
}: {
  activeTab: PaymentTab;
  trailing?: ReactNode;
}) {
  return (
    <header className="admin-animate-fade-in overflow-visible bg-white px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
            Live Orders
          </h1>
          <p className="admin-transition-smooth mt-1 text-[11px] text-[var(--color-text-muted)] sm:mt-1.5 sm:text-xs">
            <span className="font-medium text-[var(--color-primary)]">
              {activeTab}
            </span>
            <span className="mx-1.5 text-[var(--color-text-muted)]/35">—</span>
            {TAB_HINT[activeTab]}
          </p>
        </div>
        {trailing}
      </div>
    </header>
  );
}
