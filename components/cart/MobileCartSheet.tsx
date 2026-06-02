"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cartCheckoutUrl } from "../../lib/checkout-url";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Button } from "../ui/Button";
import { QuantityStepper } from "../ui/QuantityStepper";
import { cartSubtotal, cartTotal, formatMoney } from "./cartUtils";
import { useCart } from "./CartContext";

export function MobileCartSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose(): void;
}) {
  const router = useRouter();
  const { items, pieceCount, setQty, remove } = useCart();
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const total = useMemo(() => cartTotal(subtotal), [subtotal]);

  function onCheckout() {
    if (items.length === 0) return;
    onClose();
    router.push(cartCheckoutUrl("/"));
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return (
      <div className="fixed inset-0 z-[60] pointer-events-none lg:hidden" aria-hidden />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-auto lg:hidden">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/35"
        aria-label="Close cart"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className="absolute bottom-0 left-0 right-0 flex max-h-[min(82vh,100%)] flex-col rounded-t-2xl bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-zinc-300" aria-hidden />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-surface-line)] px-4 pb-3">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <MaterialIcon
              name="shopping_cart"
              className="text-[var(--color-primary)]"
            />
            <span>Your Order</span>
            {pieceCount > 0 ? (
              <span
                className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]"
                suppressHydrationWarning
              >
                {pieceCount}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100"
            aria-label="Close cart"
          >
            <MaterialIcon name="close" filled={false} />
          </button>
        </div>

        <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-600">
              Your cart is empty. Add items from the menu.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((it) => (
                <li
                  key={String(it.product.id)}
                  className="flex gap-3 rounded-xl border border-[var(--color-surface-line)]/60 bg-[var(--color-surface-subtle)]/40 p-2.5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {it.product.image_url ? (
                      <Image
                        src={it.product.image_url}
                        alt={it.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {it.product.name}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                        {formatMoney(it.product.price * it.quantity)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityStepper
                        value={it.quantity}
                        onChange={(q) => setQty(it.product.id, q)}
                      />
                      <button
                        type="button"
                        className="cursor-pointer text-xs text-zinc-500 hover:text-rose-600"
                        onClick={() => remove(it.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-surface-line)] bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span className="text-[var(--color-primary)]" suppressHydrationWarning>
              {formatMoney(total)}
            </span>
          </div>
          {error ? (
            <p className="mt-2 text-sm text-rose-800">{error}</p>
          ) : null}
          <Button
            type="button"
            className="mt-4 w-full py-3"
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            {`Review Payment (${pieceCount})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
