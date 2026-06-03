"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cartCheckoutUrl } from "../../lib/checkout-url";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { cartSubtotal, cartTotal, formatMoney } from "./cartUtils";
import { useTable } from "../table/TableProvider";
import { useCart } from "./CartContext";
import { QuantityStepper } from "../ui/QuantityStepper";
import { UI_MOTION, uiStaggerMs } from "@/lib/ui-motion";
import { Button } from "../ui/Button";

export function CartPanel() {
  const router = useRouter();
  const { hasTableFromQr, tableNumber } = useTable();
  const { items, lineCount, setQty, remove } = useCart();
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const total = useMemo(() => cartTotal(subtotal), [subtotal]);

  function onCheckout() {
    if (items.length === 0) return;
    router.push(
      cartCheckoutUrl(
        MENU_PAGE_PATH,
        hasTableFromQr ? tableNumber : undefined
      )
    );
  }

  return (
    <aside
      className={`${UI_MOTION.scaleIn} hidden h-full min-h-0 w-[360px] shrink-0 overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.08)] lg:flex lg:flex-col`}
      style={{ animationDelay: "100ms" }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-surface-line)] bg-white p-4">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="text-[var(--color-primary)]">🛒</span>
          <span className="text-xl">Your Order</span>
        </div>
        <div
          key={lineCount}
          className={`${UI_MOTION.countPop} rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white`}
          suppressHydrationWarning
        >
          {lineCount} {lineCount === 1 ? "item" : "items"}
        </div>
      </div>

      <div
        className="cart-scroll flex-1 overflow-y-auto bg-[var(--color-surface-subtle)] p-4"
        suppressHydrationWarning
      >
        {items.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((it, index) => (
              <div
                key={String(it.product.id)}
                className={`${UI_MOTION.fadeUp} group flex items-start gap-3 border-b border-[var(--color-surface-line)] py-2 last:border-b-0`}
                style={{ animationDelay: uiStaggerMs(index, 40) }}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  {it.product.image_url ? (
                    <Image
                      src={it.product.image_url}
                      alt={it.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-zinc-900">
                        {it.product.name}
                      </div>
                      {it.note ? (
                        <div className="truncate text-xs text-[var(--color-text-muted)]">
                          {it.note}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold text-[var(--color-primary)]">
                      {formatMoney(it.product.price)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      value={it.quantity}
                      onChange={(q) => setQty(it.product.id, q)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-1 text-xs text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      onClick={() => remove(it.product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--color-surface-line)] bg-white p-4">
        <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
          <span>Total</span>
          <span className="text-[var(--color-primary)]" suppressHydrationWarning>
            {formatMoney(total)}
          </span>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          className="mt-4 w-full py-3 text-base"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Review Payment →
        </Button>
      </div>
    </aside>
  );
}
