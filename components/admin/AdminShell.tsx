"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "../brand/BrandLogo";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminQrSidebar } from "./AdminQrSidebar";

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
  const [qrSheetOpen, setQrSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-80 flex-col border-r border-[var(--color-surface-line)] bg-gradient-to-b from-[#eef2fc] to-[#e8ecf8] lg:flex">
        <div className="shrink-0 border-b border-[var(--color-surface-line)]/80 bg-white/60 px-5 py-5 backdrop-blur-sm">
          <BrandLogo
            href="/admin"
            subtitle="Admin Console"
            textClassName="text-xl font-bold text-[var(--color-primary)]"
          />
        </div>

        <nav className="shrink-0 py-3" aria-label="Admin">
          <ul className="text-sm">
            <li>
              <Link href="/admin" className={navLinkClass(true)}>
                <MaterialIcon name="dashboard" filled={false} className="text-xl" />
                Live Orders
              </Link>
            </li>
          </ul>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-1">
          <AdminQrSidebar />
        </div>
      </aside>

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--color-surface-line)] bg-white px-4 shadow-sm lg:hidden">
        <BrandLogo
          href="/admin"
          textClassName="text-lg font-bold leading-none text-[var(--color-primary)]"
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQrSheetOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-[var(--color-primary)]"
            aria-label="Table QR codes"
          >
            <MaterialIcon name="qr_code_2" filled={false} />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="cursor-pointer rounded-lg p-2 text-[var(--color-primary)]"
            aria-label="Refresh orders"
          >
            <MaterialIcon name="refresh" filled={false} />
          </button>
        </div>
      </header>

      {qrSheetOpen ? (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Table QR codes"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setQrSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-[var(--background)] px-4 pb-[max(5rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_48px_rgba(0,0,0,0.2)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Table QR codes</h2>
              <button
                type="button"
                onClick={() => setQrSheetOpen(false)}
                className="cursor-pointer rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
              >
                <MaterialIcon name="close" filled={false} />
              </button>
            </div>
            <AdminQrSidebar />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen w-full flex-1 flex-col lg:ml-80">
        <div className="flex-1 pt-16 lg:pt-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-[var(--color-surface-line)] bg-white px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
        <Link
          href="/admin"
          className="flex cursor-pointer flex-col items-center rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-white"
        >
          <MaterialIcon name="receipt_long" className="text-xl" />
          <span className="mt-1 text-[10px] font-bold">Orders</span>
        </Link>
        <button
          type="button"
          onClick={() => setQrSheetOpen(true)}
          className="flex cursor-pointer flex-col items-center px-4 py-1 text-[var(--color-text-muted)]"
        >
          <MaterialIcon name="qr_code_2" filled={false} className="text-xl" />
          <span className="mt-1 text-[10px] font-semibold">QR codes</span>
        </button>
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
