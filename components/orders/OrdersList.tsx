"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listOrders, type Order } from "../../client/services/orders";
import { payOrder } from "../../client/services/payOrder";
import { formatMoney } from "../cart/cartUtils";
import { Button } from "../ui/Button";
import { MaterialIcon } from "../ui/MaterialIcon";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function statusClass(status: Order["payment_status"]) {
  if (status === "Paid") return "bg-green-100 text-green-800";
  if (status === "Failed") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-900";
}

function OrderCard({
  order,
  isPaying,
  onPay,
  layout,
}: {
  order: Order;
  isPaying: boolean;
  onPay(order: Order): void;
  layout: "compact" | "desktop";
}) {
  const isPending = order.payment_status === "Pending";
  const checkoutHref = `/checkout?orderId=${encodeURIComponent(String(order.id))}`;

  return (
    <article
      className={[
        "rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-sm",
        layout === "desktop" ? "p-5" : "p-4",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={[
              "font-semibold text-zinc-900",
              layout === "desktop" ? "text-base" : "text-sm",
            ].join(" ")}
          >
            Order #{String(order.id).slice(0, 8)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            statusClass(order.payment_status),
          ].join(" ")}
        >
          {order.payment_status}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-600">
        {order.items.length} {order.items.length === 1 ? "item" : "items"}
      </p>
      <p
        className={[
          "mt-1 font-bold text-[var(--color-primary)]",
          layout === "desktop" ? "text-lg" : "text-base",
        ].join(" ")}
      >
        {formatMoney(order.total_amount)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {isPending ? (
          <Button
            type="button"
            className="py-2 text-sm"
            disabled={isPaying}
            onClick={() => onPay(order)}
          >
            {isPaying ? "Processing…" : "Pay Now"}
          </Button>
        ) : null}
        <Link
          href={checkoutHref}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--color-surface-line)] bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-[var(--color-surface-subtle)]"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export function OrdersList({
  variant = "compact",
}: {
  variant?: "compact" | "desktop";
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return listOrders()
      .then(({ data }) => setOrders(data))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load orders";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    function onOrderUpdated() {
      refresh();
    }
    window.addEventListener("order-updated", onOrderUpdated);
    return () => window.removeEventListener("order-updated", onOrderUpdated);
  }, [refresh]);

  async function onPayNow(order: Order) {
    setPayingId(String(order.id));
    setError(null);
    try {
      await payOrder(order.id);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setError(message);
    } finally {
      setPayingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-600">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-surface-line)] bg-white p-10 text-center">
        <MaterialIcon
          name="receipt_long"
          filled={false}
          className="mx-auto text-5xl text-zinc-300"
        />
        <p className="mt-4 text-base font-semibold text-zinc-900">
          No orders yet
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Items you order from the menu will appear here.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex cursor-pointer rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  const listClass =
    variant === "desktop"
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-3";

  return (
    <ul className={listClass}>
      {orders.map((order) => (
        <li key={String(order.id)}>
          <OrderCard
            order={order}
            isPaying={payingId === String(order.id)}
            onPay={onPayNow}
            layout={variant}
          />
        </li>
      ))}
    </ul>
  );
}
