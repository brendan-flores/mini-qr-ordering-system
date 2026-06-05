"use client";

import type { ReactNode } from "react";

/** Groups Live Orders header, filters, and list under one surface. */
export function LiveOrdersSection({
  header,
  filters,
  children,
}: {
  header: ReactNode;
  filters: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-animate-fade-up rounded-xl border border-[var(--color-surface-line)] bg-white shadow-[0_1px_2px_rgba(18,28,42,0.04)] sm:rounded-2xl">
      <div className="relative z-30 overflow-visible rounded-t-xl sm:rounded-t-2xl">
        {header}
      </div>
      <div className="relative z-0 overflow-hidden border-t border-[var(--color-surface-line)]/80 bg-[var(--color-surface-subtle)]/25 px-3 py-3 sm:px-4 sm:py-3.5">
        {filters}
      </div>
      <div className="relative z-0 overflow-hidden rounded-b-xl border-t border-[var(--color-surface-line)]/60 sm:rounded-b-2xl">
        {children}
      </div>
    </section>
  );
}
