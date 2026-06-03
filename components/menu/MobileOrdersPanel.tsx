"use client";

import { OrdersList } from "../orders/OrdersList";

export function MobileOrdersPanel() {
  return (
    <div className="pb-4">
      <h2 className="mb-1 px-1 text-xl font-semibold text-zinc-900">
        Your Orders
      </h2>
      <p className="mb-4 px-1 text-sm text-[var(--color-text-muted)]">
        Orders from this phone only. Tap Track order for kitchen updates.
      </p>
      <OrdersList variant="compact" checkoutReturn="/menu-page?tab=orders" />
    </div>
  );
}
