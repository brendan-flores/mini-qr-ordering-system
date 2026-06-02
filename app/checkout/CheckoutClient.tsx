"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { listOrders, type Order } from "../../client/services/orders";
import { getStoredOrder, payOrder } from "../../client/services/payOrder";
import { formatMoney } from "../../components/cart/cartUtils";

export default function CheckoutClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  const [order, setOrder] = useState<Order | null>(() => getStoredOrder());
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const stored = getStoredOrder();
    if (stored && String(stored.id) === String(orderId)) {
      setOrder(stored);
      return;
    }

    setLoading(true);
    listOrders()
      .then(({ data }) => {
        const found =
          data.find((o) => String(o.id) === String(orderId)) ?? null;
        setOrder(found);
      })
      .catch((e: any) => setError(e?.message ?? "Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const canPay = useMemo(
    () => order && order.payment_status === "Pending",
    [order]
  );

  async function simulatePay() {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      const data = await payOrder(order.id);
      setOrder(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Payment failed";
      setError(message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <a href="/" className="text-sm font-semibold text-zinc-700">
            ← Back to menu
          </a>
          <div className="text-base font-extrabold text-rose-700">Checkout</div>
          <div className="w-[90px]" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600">
            Loading order…
          </div>
        ) : !order ? (
          <div className="rounded-2xl bg-white p-6">
            <div className="text-base font-semibold text-zinc-900">
              Order not found
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              Please go back and checkout again.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-zinc-500">Order ID</div>
                <div className="font-mono text-sm font-semibold text-zinc-900">
                  {order.id}
                </div>
              </div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                {order.payment_status}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {order.items.map((it) => (
                <div
                  key={`${String(it.product_id)}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-900">
                      {it.name}{" "}
                      <span className="text-zinc-500">× {it.quantity}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-zinc-900">
                    {formatMoney(it.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
              <div className="text-sm text-zinc-600">Total</div>
              <div className="text-lg font-extrabold text-rose-700">
                {formatMoney(order.total_amount)}
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="w-full py-3"
                disabled={!canPay || paying}
                onClick={simulatePay}
              >
                {paying ? "Processing…" : "Pay Now"}
              </Button>
              <Button
                type="button"
                className="w-full py-3"
                variant="secondary"
                onClick={() => (window.location.href = "/admin")}
              >
                View in Admin
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

