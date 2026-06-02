"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createOrder } from "../../client/services/orders";
import { cartSubtotal, formatMoney } from "./cartUtils";
import { useCart } from "./CartContext";
import { QuantityStepper } from "../ui/QuantityStepper";
import { Button } from "../ui/Button";

export function CartPanel() {
  const router = useRouter();
  const { items, setQty, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const taxRate = 0.085;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  async function onCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        items: items.map((it) => ({
          product_id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image_url: it.product.image_url ?? null,
        })),
        total_amount: Number(total.toFixed(2)),
      };
      const { data } = await createOrder(payload);
      clear();
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lastOrder", JSON.stringify(data));
      }
      router.push(`/checkout?orderId=${encodeURIComponent(String(data.id))}`);
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="sticky top-6 h-fit w-full rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 p-4">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <span>🛒</span>
          <span>Your Order</span>
        </div>
        <div className="rounded-full bg-rose-700 px-3 py-1 text-xs font-semibold text-white">
          {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {items.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((it) => (
              <div key={String(it.product.id)} className="flex gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-zinc-100">
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">
                        {it.product.name}
                      </div>
                      {it.note ? (
                        <div className="truncate text-xs text-zinc-500">
                          {it.note}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold text-rose-700">
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
                      className="text-xs text-zinc-500"
                      onClick={() => remove(it.product.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-black/5 pt-4">
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
            <span>Tax (8.5%)</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span className="text-rose-700">{formatMoney(total)}</span>
          </div>

          {error ? (
            <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            className="mt-4 w-full py-3 text-base"
            disabled={items.length === 0 || submitting}
            onClick={onCheckout}
          >
            {submitting ? "Processing..." : "Proceed to Checkout →"}
          </Button>
        </div>
      </div>
    </aside>
  );
}

