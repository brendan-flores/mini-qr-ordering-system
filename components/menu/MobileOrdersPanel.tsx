"use client";

import { OrdersList } from "../orders/OrdersList";

export function MobileOrdersPanel() {
  return (
    <div className="pb-4">
      <h2 className="mb-1 px-1 text-xl font-semibold text-zinc-900">
        Your Orders
      </h2>
      <p className="mb-4 px-1 text-sm text-[var(--color-text-muted)]">
        Complete payment for pending orders or tap for details.
      </p>
      <OrdersList variant="compact" checkoutReturn="/?tab=orders" />
    </div>
  );
}
