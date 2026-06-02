"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listOrders,
  updateOrderPaymentStatus,
  type Order,
} from "../../client/services/orders";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../components/cart/cartUtils";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listOrders();
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const totals = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.payment_status === "Pending").length,
      paid: orders.filter((o) => o.payment_status === "Paid").length,
      failed: orders.filter((o) => o.payment_status === "Failed").length,
    };
  }, [orders]);

  async function setPayment(order: Order, payment_status: Order["payment_status"]) {
    setUpdating(String(order.id));
    try {
      const { data } = await updateOrderPaymentStatus(order.id, payment_status);
      setOrders((prev) => prev.map((o) => (String(o.id) === String(order.id) ? data : o)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a href="/" className="text-sm font-semibold text-zinc-700">
            ← Back to menu
          </a>
          <div className="text-base font-extrabold text-rose-700">Admin Dashboard</div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">All</div>
            <div className="mt-1 text-xl font-extrabold text-zinc-900">{totals.all}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">Pending</div>
            <div className="mt-1 text-xl font-extrabold text-zinc-900">{totals.pending}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">Paid</div>
            <div className="mt-1 text-xl font-extrabold text-zinc-900">{totals.paid}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">Failed</div>
            <div className="mt-1 text-xl font-extrabold text-zinc-900">{totals.failed}</div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600">Loading orders…</div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-800">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600">No orders yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const isOpen = expanded === String(o.id);
              const isUpdating = updating === String(o.id);
              return (
                <div key={String(o.id)} className="rounded-2xl border border-black/5 bg-white shadow-sm">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : String(o.id))}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">
                        Order <span className="font-mono">{o.id}</span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{formatDate(o.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-extrabold text-rose-700">{formatMoney(o.total_amount)}</div>
                      <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                        {o.payment_status}
                      </div>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-black/5 p-4">
                      <div className="space-y-2">
                        {o.items.map((it) => (
                          <div
                            key={`${String(it.product_id)}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="min-w-0 truncate font-semibold text-zinc-900">
                              {it.name} <span className="text-zinc-500">× {it.quantity}</span>
                            </div>
                            <div className="font-semibold text-zinc-900">
                              {formatMoney(it.price * it.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setPayment(o, "Pending")}
                          variant="secondary"
                          className="w-full"
                        >
                          Set Pending
                        </Button>
                        <Button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setPayment(o, "Paid")}
                          className="w-full"
                        >
                          Set Paid
                        </Button>
                        <Button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setPayment(o, "Failed")}
                          variant="secondary"
                          className="w-full"
                        >
                          Set Failed
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

