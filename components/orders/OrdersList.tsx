"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelOrder,
  orderStatusLabel,
  paymentMethodLabel,
  serviceTypeLabel,
  type Order,
} from "../../client/services/orders";
import { fetchOrdersFromHistory } from "../../client/services/order-history-fetch";
import {
  canCustomerCancel,
  effectivePaymentStatus,
  isOrderCancelled,
  orderNeedsStatusPolling,
} from "../../lib/orders/order-rules";
import { getStoredOrder, saveStoredOrder } from "../../client/services/payOrder";
import { ORDER_UPDATED_EVENT } from "../../lib/order-events";
import { checkoutUrl } from "../../lib/checkout-url";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { formatMoney } from "../cart/cartUtils";
import { MaterialIcon } from "../ui/MaterialIcon";

/** Refresh in-progress orders only; completed/cancelled stay static. */
const POLL_MS = 30_000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function paymentStatusClass(status: Order["payment_status"]) {
  const label = effectivePaymentStatus(status);
  if (label === "Paid") return "bg-green-100 text-green-800";
  if (label === "Failed") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-900";
}

function kitchenStatusClass(status: Order["order_status"]) {
  const s = status ?? "received";
  if (s === "preparing") return "bg-amber-100 text-amber-900";
  if (s === "serving") return "bg-violet-100 text-violet-900";
  if (s === "served" || s === "completed") return "bg-emerald-100 text-emerald-900";
  if (s === "cancelled") return "bg-zinc-200 text-zinc-700";
  return "bg-sky-100 text-sky-900";
}

function OrderCard({
  order,
  layout,
  checkoutReturn,
  onCancel,
  cancelling,
}: {
  order: Order;
  layout: "compact" | "desktop";
  checkoutReturn: string;
  onCancel?(order: Order): void;
  cancelling?: boolean;
}) {
  const checkoutHref = checkoutUrl(order.id, checkoutReturn);
  const method = order.payment_method ?? "cod";
  const kitchen = order.order_status ?? "received";

  return (
    <article
      className={[
        "rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-sm",
        layout === "compact" ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={[
              "font-semibold text-zinc-900",
              layout === "compact" ? "text-sm" : "text-base",
            ].join(" ")}
          >
            Order #{String(order.id).slice(0, 8)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatDate(order.created_at)}
            {order.service_type === "takeout"
              ? ` · ${serviceTypeLabel("takeout")}`
              : order.table_number
                ? ` · Table ${order.table_number}`
                : ""}
          </p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            paymentStatusClass(order.payment_status),
          ].join(" ")}
        >
          {effectivePaymentStatus(order.payment_status)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={[
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            kitchenStatusClass(kitchen),
          ].join(" ")}
        >
          Kitchen: {orderStatusLabel(kitchen)}
        </span>
      </div>

      <p className="mt-2 text-xs font-medium text-[var(--color-text-muted)]">
        {paymentMethodLabel(method, order.service_type ?? "dine_in")}
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        {order.items.length} {order.items.length === 1 ? "item" : "items"}
      </p>
      <p
        className={[
          "mt-1 font-bold text-[var(--color-primary)]",
          layout === "compact" ? "text-base" : "text-lg",
        ].join(" ")}
      >
        {formatMoney(order.total_amount)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {order.payment_status === "Failed" && method === "gcash" ? (
          <Link
            href={checkoutHref}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try payment again
          </Link>
        ) : null}
        {canCustomerCancel(order) && onCancel ? (
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(order)}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50"
          >
            {cancelling ? "Cancelling…" : "Cancel order"}
          </button>
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
  checkoutReturn = "/orders",
  pollEnabled = true,
}: {
  variant?: "compact" | "desktop" | "responsive";
  checkoutReturn?: string;
  /** Set false when the panel is not visible (e.g. hidden tab). */
  pollEnabled?: boolean;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const initialLoad = useRef(true);
  const refreshing = useRef(false);

  async function handleCancel(order: Order) {
    if (
      !window.confirm(
        "Cancel this order? It will be removed from the kitchen queue."
      )
    ) {
      return;
    }
    setCancellingId(String(order.id));
    setError(null);
    try {
      const { data } = await cancelOrder(order.id);
      saveStoredOrder(data);
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(data.id) ? data : o))
      );
      window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not cancel order";
      setError(message);
    } finally {
      setCancellingId(null);
    }
  }

  const refresh = useCallback(async (showLoading: boolean) => {
    if (refreshing.current) return;
    refreshing.current = true;
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const valid = await fetchOrdersFromHistory();
      setOrders(valid);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load orders";
      if (showLoading) setError(message);
    } finally {
      refreshing.current = false;
      if (showLoading) setLoading(false);
    }
  }, []);

  const hasActivePolling = orders.some(orderNeedsStatusPolling);

  useEffect(() => {
    if (!pollEnabled) return;
    void refresh(true).finally(() => {
      initialLoad.current = false;
    });
  }, [refresh, pollEnabled]);

  useEffect(() => {
    if (!pollEnabled) return;

    function onRefresh() {
      void refresh(false);
    }

    window.addEventListener(ORDER_UPDATED_EVENT, onRefresh);
    return () => window.removeEventListener(ORDER_UPDATED_EVENT, onRefresh);
  }, [refresh, pollEnabled]);

  useEffect(() => {
    if (!pollEnabled || !hasActivePolling) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh(false);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [refresh, pollEnabled, hasActivePolling]);

  useEffect(() => {
    if (!pollEnabled) return;

    function onVisible() {
      if (document.visibilityState !== "visible") return;
      void refresh(false);
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh, pollEnabled]);

  if (loading && initialLoad.current) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-zinc-600">Loading orders…</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
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
          Orders you place from this device will appear here.
        </p>
        <Link
          href={MENU_PAGE_PATH}
          className="mt-5 inline-flex cursor-pointer rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse menu
        </Link>
      </div>
    );
  }

  const listClass =
    variant === "responsive"
      ? "flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3"
      : variant === "desktop"
        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        : "flex flex-col gap-3";

  const activeOrders = orders.filter((o) => !isOrderCancelled(o));
  const cancelledOrders = orders.filter((o) => isOrderCancelled(o));

  function renderList(items: Order[]) {
    return (
      <ul className={listClass}>
        {items.map((order) => (
          <li key={String(order.id)}>
            <OrderCard
              order={order}
              layout={variant === "desktop" ? "desktop" : "compact"}
              checkoutReturn={checkoutReturn}
              onCancel={handleCancel}
              cancelling={cancellingId === String(order.id)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      {activeOrders.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Active orders
          </h2>
          {renderList(activeOrders)}
        </section>
      ) : null}
      {cancelledOrders.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Cancelled
          </h2>
          {renderList(cancelledOrders)}
        </section>
      ) : null}
    </div>
  );
}
