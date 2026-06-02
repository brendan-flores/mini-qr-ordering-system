"use client";

import Link from "next/link";
import { CartProvider } from "../../components/cart/CartContext";
import { DesktopHeader } from "../../components/layout/DesktopHeader";
import { OrdersList } from "../../components/orders/OrdersList";
import { MaterialIcon } from "../../components/ui/MaterialIcon";

export default function OrdersPage() {
  return (
    <CartProvider>
      {/* Mobile */}
      <div className="flex min-h-dvh flex-col bg-[var(--background)] lg:hidden">
        <header className="sticky top-0 z-40 border-b border-[var(--color-surface-line)] bg-[var(--background)] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
              aria-label="Back to menu"
            >
              <MaterialIcon name="arrow_back" filled={false} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-zinc-900">Your Orders</h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Pay or view order details
              </p>
            </div>
          </div>
        </header>

        <main className="menu-scroll flex-1 overflow-y-auto px-4 py-4 pb-28">
          <OrdersList variant="compact" />
        </main>
      </div>

      {/* Desktop */}
      <div className="hidden min-h-screen flex-col bg-[var(--color-background)] lg:flex">
        <DesktopHeader />
        <main className="menu-scroll mx-auto w-full max-w-[1280px] flex-1 overflow-y-auto px-6 pb-12 pt-24">
          <div className="mb-8 border-b border-[var(--color-surface-line)] pb-6">
            <h1 className="text-3xl font-bold text-zinc-900">Your Orders</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-text-muted)]">
              Review past orders, complete pending payments, or open checkout for
              full details.
            </p>
          </div>
          <OrdersList variant="desktop" />
        </main>
      </div>
    </CartProvider>
  );
}
