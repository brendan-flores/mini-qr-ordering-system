"use client";

import { formatMoney } from "../cart/cartUtils";
import { GcashLogoMark } from "./checkoutParts";
import { MaterialIcon } from "../ui/MaterialIcon";
import type { GcashOverlayState } from "../../lib/gcash-payment-flow";

export function GcashPaymentOverlay({
  state,
  amount,
}: {
  state: GcashOverlayState;
  amount: number;
}) {
  const { message, progress, phase } = state;
  const isError = phase === "error";
  const isSuccess = phase === "success";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#001a33]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gcash-pay-title"
      aria-busy={phase === "processing"}
    >
      <div className="gcash-pay-card w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,125,254,0.35)]">
        <div className="bg-gradient-to-br from-[#007dfe] to-[#0056b8] px-6 py-5 text-center text-white">
          <GcashLogoMark size={56} />
          <h2 id="gcash-pay-title" className="mt-3 text-lg font-bold tracking-tight">
            GCash
          </h2>
          <p className="mt-1 text-xs text-white/80">Secure mobile payment</p>
        </div>

        <div className="px-6 py-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Amount to pay
          </p>
          <p className="mt-1 text-center text-3xl font-extrabold text-zinc-900">
            {formatMoney(amount)}
          </p>

          <div className="mt-6 flex justify-center">
            {isError ? (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <MaterialIcon name="close" filled className="text-4xl" />
              </span>
            ) : isSuccess ? (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 gcash-pay-pop">
                <MaterialIcon name="check_circle" filled className="text-4xl" />
              </span>
            ) : (
              <span className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-4 border-[#007dfe]/20" />
                <span className="gcash-pay-spinner absolute inset-0 rounded-full border-4 border-transparent border-t-[#007dfe]" />
                <GcashLogoMark size={40} />
              </span>
            )}
          </div>

          <p
            className={[
              "mt-5 min-h-[2.5rem] text-center text-sm font-semibold transition-colors",
              isError
                ? "text-rose-700"
                : isSuccess
                  ? "text-emerald-700"
                  : "text-zinc-800",
            ].join(" ")}
            key={message}
          >
            {message}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8f4ff]">
            <div
              className={[
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isError
                  ? "bg-rose-500"
                  : isSuccess
                    ? "bg-emerald-500"
                    : "bg-[#007dfe]",
              ].join(" ")}
              style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
            />
          </div>

          {phase === "processing" ? (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span className="gcash-pay-dot inline-block h-1.5 w-1.5 rounded-full bg-[#007dfe]" />
              <span className="gcash-pay-dot gcash-pay-dot-2 inline-block h-1.5 w-1.5 rounded-full bg-[#007dfe]" />
              <span className="gcash-pay-dot gcash-pay-dot-3 inline-block h-1.5 w-1.5 rounded-full bg-[#007dfe]" />
              <span className="sr-only">Processing payment</span>
            </p>
          ) : null}

          <p className="mt-3 text-center text-[10px] text-[var(--color-text-muted)]">
            Do not close this page
          </p>
        </div>
      </div>
    </div>
  );
}
