"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createOrder,
  getOrder,
  paymentMethodLabel,
  updateOrderPaymentStatus,
  type Order,
  type OrderItem,
  type PaymentMethod,
  type ServiceType,
} from "../../client/services/orders";
import { useTable } from "../table/TableProvider";
import { TableBadge } from "../table/TableBadge";
import { getStoredOrder, saveStoredOrder } from "../../client/services/payOrder";
import {
  cartCheckoutUrl,
  isOrderConfirmed,
  orderTrackUrl,
} from "../../lib/checkout-url";
import { useCart } from "../cart/CartContext";
import { cartSubtotal, cartTotal, formatMoney } from "../cart/cartUtils";
import { BrandLogo } from "../brand/BrandLogo";
import {
  CheckoutStepper,
  GcashLogoMark,
  OrderLineItem,
  OrderTotalsBreakdown,
  PaymentHints,
  PaymentMethodCard,
} from "./checkoutParts";
import { GcashPaymentOverlay } from "./GcashPaymentOverlay";
import {
  runGcashPaymentFlow,
  type GcashOverlayState,
} from "../../lib/gcash-payment-flow";
import { Button } from "../ui/Button";
import { MaterialIcon } from "../ui/MaterialIcon";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { validateIntegerTableNumber } from "@/lib/table";

type GcashSimResult = "success" | "failure";

export default function CheckoutClient() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const returnTo = params.get("return");

  const { items: cartItems, clear: clearCart } = useCart();
  const { tableNumber } = useTable();
  const [order, setOrder] = useState<Order | null>(() => getStoredOrder());
  const [loading, setLoading] = useState(!!orderId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [serviceType, setServiceType] = useState<ServiceType>("dine_in");
  const [gcashResult, setGcashResult] = useState<GcashSimResult>("success");
  const [gcashOverlay, setGcashOverlay] = useState<GcashOverlayState | null>(
    null
  );
  const cartLineItems = useMemo<OrderItem[]>(
    () =>
      cartItems.map((it) => ({
        product_id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        image_url: it.product.image_url ?? null,
      })),
    [cartItems]
  );

  const cartTotalAmount = useMemo(() => {
    const sub = cartSubtotal(cartItems);
    return cartTotal(sub);
  }, [cartItems]);

  const isCartMode = !orderId;
  const displayItems = isCartMode ? cartLineItems : (order?.items ?? []);
  const displayTotal = isCartMode ? cartTotalAmount : (order?.total_amount ?? 0);

  const canSubmit = useMemo(() => {
    if (isCartMode) return cartLineItems.length > 0;
    if (!order) return false;
    if (order.payment_method === "gcash") {
      return (
        order.payment_status === "Pending" || order.payment_status === "Failed"
      );
    }
    return false;
  }, [isCartMode, cartLineItems.length, order]);

  const showGcashSimulator =
    paymentMethod === "gcash" &&
    (isCartMode ||
      order?.payment_method === "gcash");

  const totalQty = useMemo(
    () => displayItems.reduce((sum, it) => sum + it.quantity, 0),
    [displayItems]
  );

  const paymentFailed =
    !isCartMode && order?.payment_status === "Failed";

  function homePath() {
    return returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH;
  }

  useEffect(() => {
    if (!orderId) return;
    const stored = getStoredOrder();
    if (stored && String(stored.id) === String(orderId)) {
      if (isOrderConfirmed(stored)) {
        router.replace(orderTrackUrl(stored.id, { returnTo: homePath() }));
        return;
      }
      setOrder(stored);
      setPaymentMethod(stored.payment_method);
      setLoading(false);
      return;
    }

    setLoading(true);
    getOrder(orderId)
      .then(({ data: found }) => {
        if (found && isOrderConfirmed(found)) {
          router.replace(orderTrackUrl(found.id, { returnTo: homePath() }));
          return;
        }
        setOrder(found);
        if (found) setPaymentMethod(found.payment_method);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load order";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [orderId, router, returnTo]);

  function goBack() {
    if (isCartMode) {
      router.push(homePath());
      return;
    }
    router.push(cartCheckoutUrl(homePath()));
  }

  function goToConfirmation(data: Order) {
    saveStoredOrder(data);
    router.push(
      orderTrackUrl(data.id, { placed: true, returnTo: homePath() })
    );
  }

  async function submitCartOrder() {
    if (cartLineItems.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (serviceType === "dine_in") {
        const tableCheck = validateIntegerTableNumber(tableNumber);
        if (!tableCheck.ok) {
          setError(tableCheck.message);
          return;
        }
      }

      if (paymentMethod === "gcash") {
        const outcome = await runGcashPaymentFlow(setGcashOverlay, {
          failure: gcashResult === "failure",
        });
        setGcashOverlay(null);
        if (outcome === "failure") {
          setError(
            "GCash payment was not completed. Your order was not sent to the kitchen — please try again."
          );
          return;
        }
      }

      const payment_status =
        paymentMethod === "cod" ? "Pending" : "Paid";

      const { data } = await createOrder({
        items: cartLineItems,
        total_amount: cartTotalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "gcash" ? payment_status : undefined,
        service_type: serviceType,
        table_number: serviceType === "dine_in" ? tableNumber : undefined,
      });
      clearCart();
      goToConfirmation(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not place order";
      setError(message);
    } finally {
      setGcashOverlay(null);
      setSubmitting(false);
    }
  }

  function checkoutUrlWithReturn(id: Order["id"]) {
    const q = new URLSearchParams({
      orderId: String(id),
      return: returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH,
    });
    return `/checkout?${q.toString()}`;
  }

  async function submitGcashRetry() {
    if (!order || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const outcome = await runGcashPaymentFlow(setGcashOverlay, {
        failure: gcashResult === "failure",
      });
      setGcashOverlay(null);
      if (outcome === "failure") {
        setError(
          "GCash payment was not completed. Please try again or choose a different outcome."
        );
        return;
      }

      const { data } = await updateOrderPaymentStatus(order.id, "Paid");
      goToConfirmation(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Payment failed";
      setError(message);
    } finally {
      setGcashOverlay(null);
      setSubmitting(false);
    }
  }

  async function handlePrimaryAction() {
    if (submitting) return;
    if (isCartMode) {
      await submitCartOrder();
      return;
    }
    if (
      order?.payment_method === "gcash" &&
      (order.payment_status === "Pending" || order.payment_status === "Failed")
    ) {
      await submitGcashRetry();
    }
  }

  const isGcashCheckout =
    (isCartMode && paymentMethod === "gcash") ||
    (!isCartMode && order?.payment_method === "gcash");

  const primaryLabel = submitting
    ? isGcashCheckout
      ? "Processing payment…"
      : "Processing…"
    : isGcashCheckout
      ? "Pay with GCash"
      : "Place Order";

  const showCheckoutContent =
    !loading &&
    !(!isCartMode && !order) &&
    !(isCartMode && cartLineItems.length === 0);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-28 lg:pb-0">
      <header className="checkout-hero-glow border-b border-[var(--color-surface-line)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-surface-line)] bg-white/90 px-3 py-2 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-primary-soft)]"
          >
            <MaterialIcon name="arrow_back" filled={false} className="text-xl" />
            Back
          </button>
          <BrandLogo
            href={MENU_PAGE_PATH}
            textClassName="text-lg font-bold text-[var(--color-primary)]"
            markScale={1.25}
          />
          <TableBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {showCheckoutContent ? (
          <div className="checkout-animate-in checkout-animate-in-delay-1 mb-8 rounded-2xl border border-[var(--color-surface-line)] bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <CheckoutStepper activeStep={2} completedStep={1} />
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-zinc-600 shadow-sm">
            Loading order…
          </div>
        ) : !isCartMode && !order ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-zinc-900">Order not found</p>
            <p className="mt-2 text-sm text-zinc-600">
              Please go back and try again.
            </p>
            <Button type="button" className="mt-6" variant="secondary" onClick={goBack}>
              Back to menu
            </Button>
          </div>
        ) : isCartMode && cartLineItems.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <MaterialIcon
              name="shopping_cart"
              filled={false}
              className="mx-auto text-5xl text-zinc-300"
            />
            <p className="mt-4 font-semibold text-zinc-900">Your cart is empty</p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => router.push(MENU_PAGE_PATH)}
            >
              Browse menu
            </Button>
          </div>
        ) : (
          <div className="checkout-animate-in checkout-animate-in-delay-2 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <section className="space-y-5 lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-line)] bg-white shadow-[0_12px_40px_rgba(184,0,53,0.08)]">
                <div className="border-b border-[var(--color-surface-line)] bg-gradient-to-r from-[var(--color-primary-soft)]/50 to-white px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                        Order summary
                      </h2>
                      <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                        {totalQty} {totalQty === 1 ? "piece" : "pieces"} ·{" "}
                        {displayItems.length}{" "}
                        {displayItems.length === 1 ? "dish" : "dishes"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white">
                      Your items
                    </span>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <ul className="flex flex-col gap-3">
                    {displayItems.map((it, idx) => (
                      <OrderLineItem
                        key={`${String(it.product_id)}-${it.name}`}
                        item={it}
                        index={idx}
                      />
                    ))}
                  </ul>
                </div>
              </div>

              {isCartMode ? (
                <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-line)] bg-white shadow-[0_12px_40px_rgba(184,0,53,0.08)]">
                  <div className="border-b border-[var(--color-surface-line)] bg-gradient-to-r from-[var(--color-primary-soft)]/50 to-white px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">
                          Dining option
                        </h2>
                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                          {serviceType === "dine_in"
                            ? `Eating at ${tableNumber ? `Table ${tableNumber}` : "your table"}`
                            : "Pick up when your order is ready"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white">
                        Dine in / Take out
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 p-5 sm:p-6">
                    <PaymentMethodCard
                      selected={serviceType === "dine_in"}
                      onSelect={() => setServiceType("dine_in")}
                      accent="brand"
                      title="Dine in"
                      description="We serve you at your table — use the table from your QR scan"
                      icon={
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-md">
                          <MaterialIcon name="restaurant" className="text-2xl" />
                        </span>
                      }
                    />
                    <PaymentMethodCard
                      selected={serviceType === "takeout"}
                      onSelect={() => setServiceType("takeout")}
                      accent="brand"
                      title="Take out"
                      description="Order for pickup — pay and collect at the counter when ready"
                      icon={
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 text-white shadow-md">
                          <MaterialIcon name="shopping_bag" className="text-2xl" />
                        </span>
                      }
                    />
                  </div>
                </div>
              ) : null}

              {paymentFailed ? (
                <div
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-900"
                  role="alert"
                >
                  <div className="flex gap-3">
                    <MaterialIcon name="error" filled className="shrink-0 text-xl" />
                    Payment failed. Please try again or choose a different outcome.
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-5 lg:col-span-5">
              <div className="lg:sticky lg:top-6 lg:space-y-5">
                <div className="hidden rounded-3xl border border-[var(--color-surface-line)] bg-white p-5 shadow-sm lg:block">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Price details
                  </h3>
                  <div className="mt-4">
                    <OrderTotalsBreakdown
                      itemCount={totalQty}
                      subtotal={displayTotal}
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-[var(--color-surface-line)] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
                  <div className="border-b border-[var(--color-surface-line)] bg-gradient-to-r from-white to-[var(--color-surface-subtle)] px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900">
                          Payment
                        </h2>
                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                          All transactions are encrypted
                        </p>
                      </div>
                      <span className="rounded-full bg-[#007dfe]/10 px-3 py-1 text-xs font-bold text-[#007dfe]">
                        Choose payment
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="space-y-4">
                        {isCartMode ? (
                          <div className="flex flex-col gap-3">
                            <PaymentMethodCard
                              selected={paymentMethod === "cod"}
                              onSelect={() => setPaymentMethod("cod")}
                              accent="brand"
                              title={
                                serviceType === "takeout"
                                  ? "Pay at the counter (cash)"
                                  : "Pay at table (cash)"
                              }
                              description={
                                serviceType === "takeout"
                                  ? "Pay with cash at the counter when you pick up"
                                  : "Pay with cash when staff serves your table"
                              }
                              icon={
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-md">
                                  <MaterialIcon name="payments" className="text-2xl" />
                                </span>
                              }
                            />
                            <PaymentMethodCard
                              selected={paymentMethod === "gcash"}
                              onSelect={() => setPaymentMethod("gcash")}
                              accent="gcash"
                              title="GCash"
                              description="Fast mobile wallet payment — confirm in your GCash app"
                              icon={<GcashLogoMark size={48} />}
                            />
                          </div>
                        ) : null}

                        {!isCartMode &&
                        order?.payment_method === "gcash" &&
                        (order.payment_status === "Pending" ||
                          order.payment_status === "Failed") ? (
                          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#007dfe]/30 bg-[#e8f4ff]/60 p-4">
                            <GcashLogoMark size={52} />
                            <div>
                              <p className="font-bold text-zinc-900">GCash</p>
                              <p className="text-sm text-[var(--color-text-muted)]">
                                Complete payment in your app, then continue below.
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {(isCartMode || showGcashSimulator) ? (
                          <PaymentHints
                            method={paymentMethod}
                            serviceType={serviceType}
                          />
                        ) : null}

                        {showGcashSimulator ? (
                          <div className="rounded-2xl border border-[var(--color-surface-line)] bg-[var(--color-surface-subtle)] p-4">
                            <label
                              htmlFor="gcash-sim"
                              className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]"
                            >
                              Payment outcome
                            </label>
                            <select
                              id="gcash-sim"
                              value={gcashResult}
                              onChange={(e) =>
                                setGcashResult(e.target.value as GcashSimResult)
                              }
                              className="mt-2 w-full cursor-pointer rounded-xl border border-white bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm outline-none transition focus:border-[#007dfe] focus:ring-2 focus:ring-[#007dfe]/25"
                            >
                              <option value="success">Payment successful</option>
                              <option value="failure">Payment declined</option>
                            </select>
                          </div>
                        ) : null}

                        {order &&
                        !isCartMode &&
                        order.payment_status !== "Pending" &&
                        order.payment_status !== "Failed" ? (
                          <div className="rounded-2xl bg-[var(--color-surface-subtle)] p-4 text-sm">
                            <p className="flex justify-between gap-2">
                              <span className="text-[var(--color-text-muted)]">Method</span>
                              <span className="font-semibold">
                                {paymentMethodLabel(
                                  order.payment_method,
                                  order.service_type ?? "dine_in"
                                )}
                              </span>
                            </p>
                            <p className="mt-2 flex justify-between gap-2">
                              <span className="text-[var(--color-text-muted)]">Status</span>
                              <span className="font-semibold">{order.payment_status}</span>
                            </p>
                          </div>
                        ) : null}

                        <div className="lg:hidden">
                          <OrderTotalsBreakdown
                            itemCount={totalQty}
                            subtotal={displayTotal}
                          />
                        </div>

                        {error ? (
                          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                            {error}
                          </div>
                        ) : null}

                        {canSubmit ? (
                          <Button
                            type="button"
                            className="hidden w-full py-3.5 text-base shadow-[0_8px_28px_rgba(184,0,53,0.3)] lg:flex"
                            disabled={submitting}
                            onClick={handlePrimaryAction}
                          >
                            {primaryLabel}
                          </Button>
                        ) : null}
                      </div>
                  </div>
                </div>

                <div className="hidden rounded-2xl border border-dashed border-[var(--color-surface-line)] bg-white/60 p-4 text-center text-xs text-[var(--color-text-muted)] lg:block">
                  <MaterialIcon
                    name="favorite"
                    filled
                    className="mx-auto text-lg text-[var(--color-primary)]"
                  />
                  <p className="mt-2">
                    Thank you for ordering with BrenCravings. Questions? Ask any
                    staff member at your table.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {showCheckoutContent && canSubmit ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-surface-line)] bg-white/95 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.1)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                Total
              </p>
              <p className="text-xl font-extrabold text-[var(--color-primary)]">
                {formatMoney(displayTotal)}
              </p>
            </div>
            <Button
              type="button"
              className="min-w-[160px] shrink-0 py-3.5 shadow-[0_8px_24px_rgba(184,0,53,0.25)]"
              disabled={submitting}
              onClick={handlePrimaryAction}
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      ) : null}

      {gcashOverlay ? (
        <GcashPaymentOverlay state={gcashOverlay} amount={displayTotal} />
      ) : null}
    </div>
  );
}
