"use client";

import Link from "next/link";
import { BrandLogo } from "../brand/BrandLogo";
import { MaterialIcon } from "../ui/MaterialIcon";

const navLinkBase =
  "mx-2 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition";

function navLinkClass(active: boolean) {
  if (active) {
    return `${navLinkBase} bg-white text-[var(--color-primary)] shadow-sm`;
  }
  return `${navLinkBase} text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]`;
}

export function AdminShell({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh(): void;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col border-r border-[var(--color-surface-line)] bg-[#eff4ff] lg:flex">
        <div className="border-b border-[var(--color-surface-line)] p-6">
          <BrandLogo
            href="/admin"
            subtitle="Admin Console"
            textClassName="text-xl font-bold text-[var(--color-primary)]"
          />
        </div>

        <ul className="flex-1 overflow-y-auto py-2 text-sm">
          <li>
            <Link href="/admin" className={navLinkClass(true)}>
              <MaterialIcon name="dashboard" filled={false} className="text-xl" />
              Live Orders
            </Link>
          </li>
        </ul>
      </aside>

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--color-surface-line)] bg-white px-4 shadow-sm lg:hidden">
        <BrandLogo
          href="/admin"
          textClassName="text-lg font-bold leading-none text-[var(--color-primary)]"
        />
        <button
          type="button"
          onClick={onRefresh}
          className="cursor-pointer rounded-lg p-2 text-[var(--color-primary)]"
          aria-label="Refresh orders"
        >
          <MaterialIcon name="refresh" filled={false} />
        </button>
      </header>

      <div className="flex min-h-screen w-full flex-1 flex-col lg:ml-72">
        <div className="flex-1 pt-16 lg:pt-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-center gap-8 rounded-t-xl border-t border-[var(--color-surface-line)] bg-white px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        <Link
          href="/admin"
          className="flex cursor-pointer flex-col items-center rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-white"
        >
          <MaterialIcon name="receipt_long" className="text-xl" />
          <span className="mt-1 text-[10px] font-bold">Orders</span>
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          className="flex cursor-pointer flex-col items-center px-3 py-1 text-[var(--color-text-muted)]"
        >
          <MaterialIcon name="refresh" filled={false} className="text-xl" />
          <span className="mt-1 text-[10px] font-semibold">Refresh</span>
        </button>
      </nav>
    </div>
  );
}
