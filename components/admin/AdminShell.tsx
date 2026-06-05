"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const onOrders = pathname === "/admin";
  const onQrSessions = pathname.startsWith("/admin/qr-sessions");
  const [qrSheetOpen, setQrSheetOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function confirmSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setLogoutConfirmOpen(false);
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-live flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-80 flex-col border-r border-[var(--color-surface-line)] bg-gradient-to-b from-[#eef2fc] to-[#e8ecf8] lg:flex">
        <div className="shrink-0 border-b border-[var(--color-surface-line)]/80 bg-white/80 px-5 py-4 backdrop-blur-sm">
          <BrandLogo
            href="/admin"
            subtitle="Admin Console"
            textClassName="text-xl font-semibold text-[var(--color-primary)]"
          />
        </div>

        <nav className="shrink-0 py-3" aria-label="Admin">
          <ul className="space-y-0.5 text-sm">
            <li>
              <Link href="/admin" className={navLinkClass(onOrders)}>
                <MaterialIcon name="dashboard" filled={false} className="text-xl" />
                Live Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/qr-sessions"
                className={navLinkClass(onQrSessions)}
              >
                <MaterialIcon
                  name="qr_code_scanner"
                  filled={false}
                  className="text-xl"
                />
                Active QR Sessions
              </Link>
            </li>
          </ul>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">
          <AdminQrSidebar />
        </div>

        <div className="shrink-0 border-t border-[var(--color-surface-line)]/80 bg-white/50 px-3 py-3">
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            disabled={signingOut}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-surface-line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] shadow-sm transition hover:border-[var(--color-primary)]/20 hover:text-[var(--color-primary)] disabled:opacity-60"
          >
            <MaterialIcon name="logout" filled={false} className="text-lg" />
            {signingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      <header className="fixed top-0 z-50 flex h-14 w-full items-center border-b border-[var(--color-surface-line)] bg-white/95 px-4 shadow-[0_1px_0_rgba(18,28,42,0.04)] backdrop-blur-md lg:hidden">
        <BrandLogo
          href="/admin"
          subtitle="Admin"
          textClassName="text-sm font-semibold leading-tight text-[var(--color-primary)]"
          subtitleClassName="text-[10px] font-normal text-[var(--color-text-muted)]/80"
          markScale={1.1}
        />
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
            className="admin-animate-modal-backdrop absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setQrSheetOpen(false)}
          />
          <div className="admin-animate-modal-panel absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-[var(--background)] px-3 pb-[max(4.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_48px_rgba(0,0,0,0.2)] sm:px-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Table QR codes</h2>
              <button
                type="button"
                onClick={() => setQrSheetOpen(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
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
        <div className="flex-1 pt-14 lg:pt-0">{children}</div>
      </div>

      <nav className="fixed bottom-0 z-50 flex w-full items-stretch justify-around gap-0.5 border-t border-[var(--color-surface-line)] bg-white/95 px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden">
        <Link
          href="/admin"
          className={[
            "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-2 transition",
            onOrders
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
          ].join(" ")}
        >
          <MaterialIcon name="receipt_long" className="text-[22px]" />
          <span className="mt-0.5 text-[10px] font-bold">Orders</span>
        </Link>
        <Link
          href="/admin/qr-sessions"
          className={[
            "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-2 transition",
            onQrSessions
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
          ].join(" ")}
        >
          <MaterialIcon name="qr_code_scanner" filled={false} className="text-[22px]" />
          <span className="mt-0.5 text-[10px] font-semibold">Sessions</span>
        </Link>
        <button
          type="button"
          onClick={() => setQrSheetOpen(true)}
          className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-subtle)]"
        >
          <MaterialIcon name="qr_code_2" filled={false} className="text-[22px]" />
          <span className="mt-0.5 text-[10px] font-semibold">QR</span>
        </button>
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(true)}
          disabled={signingOut}
          className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-primary)] disabled:opacity-60"
        >
          <MaterialIcon name="logout" filled={false} className="text-[22px]" />
          <span className="mt-0.5 text-[10px] font-semibold">
            {signingOut ? "…" : "Log out"}
          </span>
        </button>
      </nav>

      {logoutConfirmOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <button
            type="button"
            className="admin-animate-modal-backdrop absolute inset-0 cursor-pointer bg-black/45 backdrop-blur-[2px]"
            aria-label="Cancel"
            onClick={() => !signingOut && setLogoutConfirmOpen(false)}
          />
          <div className="admin-animate-modal-panel relative w-full max-w-sm rounded-2xl border border-[var(--color-surface-line)] bg-white p-5 shadow-xl sm:p-6">
            <h2
              id="logout-confirm-title"
              className="text-base font-semibold text-[var(--foreground)]"
            >
              Log out?
            </h2>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={signingOut}
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[var(--color-surface-line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-subtle)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={signingOut}
                onClick={confirmSignOut}
                className="flex-1 cursor-pointer rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {signingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
