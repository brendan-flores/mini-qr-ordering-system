"use client";

import Image from "next/image";
import { Fragment } from "react";
import type { OrderItem } from "../../client/services/orders";
import { formatMoney } from "../cart/cartUtils";
import { MaterialIcon } from "../ui/MaterialIcon";

export function GcashLogoMark({ size = 48 }: { size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#007dfe]/25"
      style={{ width: size, height: size }}
    >
      <img
        src="/gcash-logo.png"
        alt="GCash"
        className="h-[82%] w-[82%] object-contain"
        decoding="async"
      />
    </span>
  );
}

export function CheckoutStepper({
  activeStep,
  completedStep,
}: {
  activeStep: 1 | 2 | 3;
  /** Highest step that shows a checkmark (payment step stays unchecked until confirmed) */
  completedStep: 0 | 1 | 2 | 3;
}) {
  const steps = [
    { n: 1, label: "Review order" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Confirmation" },
  ] as const;

  return (
    <nav className="w-full" aria-label="Checkout progress">
      <ol className="flex w-full items-start justify-between">
        {steps.map((step, i) => {
          const done = step.n <= completedStep;
          const active = step.n === activeStep && !done;
          const prevDone = i > 0 && steps[i - 1].n <= completedStep;

          return (
            <Fragment key={step.n}>
              {i > 0 ? (
                <li
                  className="mt-4 min-w-[8px] flex-1 list-none px-1 sm:px-2"
                  aria-hidden
                >
                  <div
                    className={[
                      "h-0.5 w-full rounded-full",
                      prevDone
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-surface-line)]",
                    ].join(" ")}
                  />
                </li>
              ) : null}
              <li className="flex max-w-[33%] shrink-0 list-none flex-col items-center gap-2 sm:max-w-none">
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9",
                    done
                      ? "bg-[var(--color-primary)] text-white"
                      : active
                        ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary-soft)]"
                        : "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {done ? (
                    <MaterialIcon name="check" filled className="text-base" />
                  ) : (
                    step.n
                  )}
                </span>
                <span
                  className={[
                    "text-center text-[9px] font-bold uppercase leading-tight tracking-wide sm:text-[11px]",
                    active || done
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function OrderLineItem({
  item,
  index,
}: {
  item: OrderItem;
  index: number;
}) {
  const lineTotal = item.price * item.quantity;

  return (
    <li className="group flex gap-4 rounded-2xl border border-[var(--color-surface-line)] bg-gradient-to-br from-white to-[var(--color-surface-subtle)]/50 p-3 transition hover:border-[var(--color-primary)]/25 hover:shadow-md sm:p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--color-primary-soft)] shadow-inner sm:h-24 sm:w-24">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-primary)]">
            <MaterialIcon name="restaurant" className="text-3xl" />
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-white/90 text-[10px] font-bold text-[var(--color-primary)] shadow-sm">
          {index + 1}
        </span>
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="text-base font-bold leading-snug text-zinc-900 sm:text-lg">
          {item.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="rounded-md bg-white px-2 py-0.5 font-medium ring-1 ring-[var(--color-surface-line)]">
            Qty {item.quantity}
          </span>
          <span>{formatMoney(item.price)} each</span>
        </div>
        <p className="mt-3 text-lg font-extrabold text-[var(--color-primary)]">
          {formatMoney(lineTotal)}
        </p>
      </div>
    </li>
  );
}

export function OrderTotalsBreakdown({
  itemCount,
  subtotal,
  totalLabel = "Total due",
}: {
  itemCount: number;
  subtotal: number;
  totalLabel?: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl bg-[var(--color-surface-subtle)] p-4">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text-muted)]">
          Items ({itemCount})
        </span>
        <span className="font-semibold text-zinc-800">{formatMoney(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text-muted)]">Service fee</span>
        <span className="font-semibold text-emerald-700">Free</span>
      </div>
      <div className="border-t border-dashed border-[var(--color-surface-line)] pt-3">
        <div className="flex items-end justify-between gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {totalLabel}
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--color-primary)]">
            {formatMoney(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PaymentMethodCard({
  selected,
  onSelect,
  title,
  description,
  icon,
  accent,
}: {
  selected: boolean;
  onSelect(): void;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "brand" | "gcash";
}) {
  const border =
    accent === "gcash"
      ? selected
        ? "border-[#007dfe] bg-gradient-to-br from-[#e8f4ff] to-white shadow-[0_8px_24px_rgba(0,125,254,0.15)]"
        : "border-[var(--color-surface-line)] bg-white hover:border-[#007dfe]/40"
      : selected
        ? "border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary-soft)]/80 to-white shadow-[0_8px_24px_rgba(184,0,53,0.12)]"
        : "border-[var(--color-surface-line)] bg-white hover:border-[var(--color-primary)]/40";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "relative flex w-full cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 text-left transition",
        border,
      ].join(" ")}
    >
      {selected ? (
        <span
          className={[
            "absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white",
            accent === "gcash" ? "bg-[#007dfe]" : "bg-[var(--color-primary)]",
          ].join(" ")}
        >
          <MaterialIcon name="check" filled className="text-sm" />
        </span>
      ) : null}
      {icon}
      <span className="min-w-0 pr-6">
        <span className="block text-base font-bold text-zinc-900">{title}</span>
        <span className="mt-1 block text-sm leading-snug text-[var(--color-text-muted)]">
          {description}
        </span>
      </span>
    </button>
  );
}

export function PaymentHints({
  method,
  serviceType = "dine_in",
}: {
  method: "cod" | "gcash";
  serviceType?: "dine_in" | "takeout";
}) {
  if (method === "cod") {
    const isTakeout = serviceType === "takeout";
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-amber-950">
          <MaterialIcon name="info" filled={false} className="text-lg" />
          {isTakeout ? "Pay at the counter" : "Pay at table"}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-amber-900/90">
          <li className="flex gap-2">
            <span className="font-bold text-[var(--color-primary)]">1.</span>
            We send your order to the kitchen after you confirm.
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[var(--color-primary)]">2.</span>
            {isTakeout
              ? "Pay with cash at the counter when you pick up your order."
              : "Pay with cash when staff serves your table."}
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[var(--color-primary)]">3.</span>
            Exact change is appreciated.
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#007dfe]/20 bg-gradient-to-br from-[#e8f4ff] to-white p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-[#003d99]">
        <GcashLogoMark size={28} />
        Pay with GCash
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[#003d99]/90">
        <li className="flex gap-2">
          <span className="font-bold text-[#007dfe]">1.</span>
          Open your GCash app and confirm the amount.
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-[#007dfe]">2.</span>
          Choose the payment outcome below for this demo.
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-[#007dfe]">3.</span>
          Tap pay — you&apos;ll get instant confirmation.
        </li>
      </ul>
    </div>
  );
}
