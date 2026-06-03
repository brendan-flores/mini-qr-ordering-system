"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getOrder,
  paymentMethodLabel,
  type Order,
} from "../../client/services/orders";
import { TableBadge } from "../table/TableBadge";
import { getStoredOrder } from "../../client/services/payOrder";
import { isOrderConfirmed } from "../../lib/checkout-url";
import { formatMoney } from "../cart/cartUtils";
import { BrandLogo } from "../brand/BrandLogo";
import {
  CheckoutStepper,
  GcashLogoMark,
  OrderLineItem,
} from "./checkoutParts";
import { Button } from "../ui/Button";
import { MaterialIcon } from "../ui/MaterialIcon";
import { MENU_PAGE_PATH } from "@/lib/routes";

function confirmationTitle(order: Order) {
  if (order.payment_method === "gcash" && order.payment_status === "Paid") {
    return "Payment successful!";
  }
  return "Order confirmed!";
}

function confirmationSubtitle(order: Order) {
  if (order.payment_method === "cod") {
    return "Your order is in the kitchen. Please pay with cash when staff serves your table.";
  }
  return "Your GCash payment was received. We're preparing your order.";
}

export default function ConfirmationClient() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const returnTo = params.get("return");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const homePath = returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH;

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const stored = getStoredOrder();
    if (stored && String(stored.id) === String(orderId)) {
      if (isOrderConfirmed(stored)) {
        setOrder(stored);
        setLoading(false);
        return;
      }
    }

    getOrder(orderId)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!loading && order && !isOrderConfirmed(order)) {
      router.replace(
        `/checkout?orderId=${encodeURIComponent(String(order.id))}&return=${encodeURIComponent(homePath)}`
      );
    }
  }, [loading, order, router, homePath]);

  const placedAt = order
    ? new Date(order.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="checkout-hero-glow border-b border-[var(--color-surface-line)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="w-20" aria-hidden />
          <BrandLogo
            href={MENU_PAGE_PATH}
            textClassName="text-lg font-bold text-[var(--color-primary)]"
            markScale={1.25}
          />
          <TableBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="checkout-animate-in mb-8 rounded-2xl border border-[var(--color-surface-line)] bg-white/90 p-4 shadow-sm sm:p-5">
          <CheckoutStepper activeStep={3} completedStep={3} />
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-zinc-600 shadow-sm">
            Loading confirmation…
          </div>
        ) : !order ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-zinc-900">Order not found</p>
            <Link
              href={MENU_PAGE_PATH}
              className="mt-4 inline-block text-[var(--color-primary)]"
            >
              Back to menu
            </Link>
          </div>
        ) : (
          <div className="checkout-animate-in checkout-animate-in-delay-1 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-[0_16px_48px_rgba(16,185,129,0.12)]">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                  <MaterialIcon name="check_circle" filled className="text-5xl" />
                </div>
                <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                  {confirmationTitle(order)}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-emerald-50">
                  {confirmationSubtitle(order)}
                </p>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <dl className="grid gap-4 rounded-2xl bg-[var(--color-surface-subtle)] p-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      {order.service_type === "takeout" ? "Service" : "Table"}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-900">
                      {order.service_type === "takeout"
                        ? "Take out"
                        : order.table_number
                          ? `Table ${order.table_number}`
                          : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Order ID
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-bold text-zinc-900">
                      {String(order.id)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Date & time
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-zinc-900">
                      {placedAt}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Payment method
                    </dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      {order.payment_method === "gcash" ? (
                        <GcashLogoMark size={28} />
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
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Total amount
                    </dt>
                    <dd className="mt-1 text-xl font-extrabold text-[var(--color-primary)]">
                      {formatMoney(order.total_amount)}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Items ordered
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {order.items.map((it, idx) => (
                      <OrderLineItem
                        key={`${String(it.product_id)}-${it.name}`}
                        item={it}
                        index={idx}
                      />
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="flex-1 py-3.5"
                    onClick={() => router.push(homePath)}
                  >
                    Back to menu
                  </Button>
                  <Link
                    href="/orders"
                    className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-[var(--color-primary)] bg-white px-4 py-3.5 text-center text-base font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
                  >
                    View orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
