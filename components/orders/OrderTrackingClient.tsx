"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  cancelOrder,
  getOrder,
  paymentMethodLabel,
  type Order,
} from "@/client/services/orders";
import { getStoredOrder, saveStoredOrder } from "@/client/services/payOrder";
import { isOrderConfirmed, orderNeedsCheckout } from "@/lib/checkout-url";
import {
  confirmationHeadline,
  confirmationMessage,
  shortOrderId,
} from "@/lib/customer-order-flow";
import {
  canCustomerCancel,
  showCustomerCancelButton,
  orderNeedsStatusPolling,
} from "@/lib/orders/order-rules";
import { notifyOrderUpdated } from "@/lib/order-events";
import { useLiveOrderSync } from "@/hooks/useLiveOrderSync";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { TableBadge } from "../table/TableBadge";
import { BrandLogo } from "../brand/BrandLogo";
import { formatMoney } from "../cart/cartUtils";
import { OrderLineItem, GcashLogoMark } from "../checkout/checkoutParts";
import { Button } from "../ui/Button";
import { MaterialIcon } from "../ui/MaterialIcon";
import { OrderStatusStepper } from "./OrderStatusStepper";

export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const justPlaced = params.get("placed") === "1";
  const returnTo = params.get("return");
  const menuPath = returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(async (quiet: boolean) => {
    if (!quiet) {
      setLoading(true);
      setError(null);
    }
    try {
      const { data } = await getOrder(orderId);
      setOrder(data);
      if (isOrderConfirmed(data)) {
        saveStoredOrder(data, { notify: !quiet });
      }
      if (orderNeedsCheckout(data)) {
        router.replace(
          `/checkout?orderId=${encodeURIComponent(String(data.id))}&return=${encodeURIComponent(menuPath)}`
        );
        return;
      }
    } catch (e: unknown) {
      const stored = getStoredOrder();
      if (stored && String(stored.id) === String(orderId)) {
        setOrder(stored);
      } else {
        const message =
          e instanceof Error ? e.message : "Could not load order";
        if (!quiet) setError(message);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [orderId, router, menuPath]);

  useEffect(() => {
    void loadOrder(false);
  }, [loadOrder]);

  const shouldSync =
    Boolean(order) && orderNeedsStatusPolling(order!);

  useLiveOrderSync(
    () => {
      if (document.visibilityState === "visible") {
        void loadOrder(true);
      }
    },
    {
      enabled: shouldSync,
      scopeKey: String(orderId),
    }
  );

  async function handleCancel() {
    if (!order || !canCustomerCancel(order)) return;
    if (
      !window.confirm(
        "Cancel this order? It will be removed from the kitchen queue."
      )
    ) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const { data } = await cancelOrder(order.id);
      setOrder(data);
      saveStoredOrder(data);
      notifyOrderUpdated();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not cancel order";
      setError(message);
    } finally {
      setCancelling(false);
    }
  }

  const placedAt = order
    ? new Date(order.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--color-surface-line)] bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/orders"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
            aria-label="All orders"
          >
            <MaterialIcon name="arrow_back" filled={false} />
          </Link>
          <BrandLogo
            href={MENU_PAGE_PATH}
            textClassName="text-lg font-bold text-[var(--color-primary)]"
          />
          <TableBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <p className="text-center text-sm text-zinc-600">Loading order…</p>
        ) : error && !order ? (
          <div className="rounded-2xl bg-rose-50 p-6 text-center text-sm text-rose-800">
            {error}
            <Link
              href={MENU_PAGE_PATH}
              className="mt-4 block font-semibold text-[var(--color-primary)]"
            >
              Back to menu
            </Link>
          </div>
        ) : !order ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-zinc-900">Order not found</p>
            <p className="mt-2 text-sm text-zinc-600">
              This order may belong to another device or is no longer available.
            </p>
            <Link
              href="/orders"
              className="mt-4 inline-block text-[var(--color-primary)]"
            >
              Your orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {justPlaced ? (
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-8 text-center text-white shadow-lg">
                <MaterialIcon
                  name="check_circle"
                  filled
                  className="mx-auto text-5xl"
                />
                <h1 className="mt-4 text-2xl font-extrabold">
                  {confirmationHeadline(order)}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-emerald-50">
                  {confirmationMessage(order)}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-zinc-900">
                  Order #{shortOrderId(order.id)}
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {placedAt}
                  {order.table_number
                    ? ` · Table ${order.table_number}`
                    : order.service_type === "takeout"
                      ? " · Take out"
                      : ""}
                </p>
              </div>
            )}

            {error ? (
              <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <section className="rounded-2xl border border-[var(--color-surface-line)] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                Kitchen status
              </h2>
              <OrderStatusStepper orderStatus={order.order_status} />
              {orderNeedsStatusPolling(order) ? (
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                  Updates automatically while your order is in progress.
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-[var(--color-surface-line)] bg-white p-4 shadow-sm sm:p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Order ID
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-bold text-zinc-900">
                    #{shortOrderId(order.id)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Total
                  </dt>
                  <dd className="mt-1 text-lg font-extrabold text-[var(--color-primary)]">
                    {formatMoney(order.total_amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Payment
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    {order.payment_method === "gcash" ? (
                      <GcashLogoMark size={24} />
                    ) : (
                      <MaterialIcon
                        name="payments"
                        className="text-lg text-[var(--color-primary)]"
                      />
                    )}
                    {paymentMethodLabel(
                      order.payment_method,
                      order.service_type ?? "dine_in"
                    )}
                  </dd>
                </div>
              </dl>

              <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                Items
              </h3>
              <ul className="flex flex-col gap-3">
                {order.items.map((it, idx) => (
                  <OrderLineItem
                    key={`${String(it.product_id)}-${idx}`}
                    item={it}
                    index={idx}
                  />
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="flex-1 py-3.5"
                onClick={() => router.push(menuPath)}
              >
                Order more
              </Button>
              <Link
                href="/orders"
                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-[var(--color-primary)] bg-white px-4 py-3.5 text-center text-base font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
              >
                All orders
              </Link>
            </div>

            {showCustomerCancelButton(order) ? (
              <button
                type="button"
                disabled={cancelling || !canCustomerCancel(order)}
                title={
                  canCustomerCancel(order)
                    ? undefined
                    : "Your order is already being prepared and can no longer be cancelled."
                }
                onClick={() => void handleCancel()}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-rose-50"
              >
                {cancelling ? "Cancelling…" : "Cancel order"}
              </button>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
