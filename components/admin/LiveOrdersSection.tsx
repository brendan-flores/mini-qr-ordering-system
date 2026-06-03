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
    <section className="admin-animate-fade-up overflow-hidden rounded-xl border border-[var(--color-surface-line)] bg-white shadow-[0_1px_2px_rgba(18,28,42,0.04)] sm:rounded-2xl">
      {header}
      <div className="border-t border-[var(--color-surface-line)]/80 bg-[var(--color-surface-subtle)]/25 px-3 py-3 sm:px-4 sm:py-3.5">
        {filters}
      </div>
      <div className="border-t border-[var(--color-surface-line)]/60">{children}</div>
    </section>
  );
}
