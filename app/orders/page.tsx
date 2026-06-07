"use client";

import Link from "next/link";
import { DesktopHeader } from "../../components/layout/DesktopHeader";
import { OrderingGuard } from "../../components/ordering/OrderingGuard";
import { OrdersList } from "../../components/orders/OrdersList";
import { BrandLogo } from "../../components/brand/BrandLogo";
import { MaterialIcon } from "../../components/ui/MaterialIcon";
import { MENU_PAGE_PATH } from "@/lib/shared/config/routes";

export default function OrdersPage() {
  return (
    <OrderingGuard>
      <header className="sticky top-0 z-40 border-b border-[var(--color-surface-line)] bg-[var(--background)] px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={MENU_PAGE_PATH}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
            aria-label="Back to menu"
          >
            <MaterialIcon name="arrow_back" filled={false} />
          </Link>
          <div className="min-w-0 flex-1">
            <BrandLogo
              href={MENU_PAGE_PATH}
              textClassName="text-lg font-bold leading-none text-[var(--color-primary)]"
            />
            <p className="text-xs text-[var(--color-text-muted)]">Your orders</p>
          </div>
        </div>
      </header>

      <div className="hidden lg:block">
        <DesktopHeader />
      </div>

      <main className="menu-scroll mx-auto w-full max-w-[1280px] flex-1 overflow-y-auto px-4 py-4 pb-28 lg:px-6 lg:pb-12 lg:pt-24">
        <div className="mb-8 hidden border-b border-[var(--color-surface-line)] pb-6 lg:block">
          <h1 className="text-3xl font-bold text-zinc-900">Your Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-text-muted)]">
            Orders placed on this device appear here for up to 72 hours. Each
            new checkout creates a separate order — use Order more after
            tracking to add another round.
          </p>
        </div>
        <OrdersList variant="responsive" checkoutReturn="/orders" />
      </main>
    </OrderingGuard>
  );
}
