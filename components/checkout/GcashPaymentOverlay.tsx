"use client";

import { formatMoney } from "../cart/cartUtils";
import { GcashLogoMark } from "./checkoutParts";
import { MaterialIcon } from "../ui/MaterialIcon";
import type { GcashOverlayState } from "../../lib/gcash-payment-flow";

function StatusIcon({
  phase,
}: {
  phase: GcashOverlayState["phase"];
}) {
  if (phase === "error") {
    return (
      <span className="gcash-pay-pop flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-4 ring-rose-100">
        <MaterialIcon name="close" filled className="text-4xl" />
      </span>
    );
  }

  if (phase === "success") {
    return (
      <span className="gcash-pay-pop flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100">
        <MaterialIcon name="check_circle" filled className="text-4xl" />
      </span>
    );
  }

  return (
    <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
      <span className="absolute inset-0 rounded-full border-[3px] border-[#007dfe]/15" />
      <span className="gcash-pay-spinner absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#007dfe]" />
      <GcashLogoMark
        size={44}
        className="relative z-10 rounded-xl shadow-md ring-2 ring-white"
      />
    </div>
  );
}

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
  const isProcessing = phase === "processing";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#001a33]/50 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gcash-pay-title"
      aria-busy={isProcessing}
    >
      <div className="gcash-pay-card w-full max-w-[22rem] overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_28px_80px_rgba(0,125,254,0.28)]">
        {/* Header — logo-centered brand block */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#007dfe] via-[#0068e0] to-[#0056b8] px-6 pb-7 pt-8 text-white">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#003d99]/30 blur-xl"
            aria-hidden
          />

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-2 ring-white/40">
              <GcashLogoMark size={52} className="rounded-xl shadow-none ring-0" />
            </div>
            <h2
              id="gcash-pay-title"
              className="mt-4 text-lg font-bold tracking-tight"
            >
              GCash
            </h2>
            <p className="mt-1 text-xs font-medium text-white/85">
              Secure mobile payment
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="rounded-2xl border border-[#e8f4ff] bg-gradient-to-b from-[#f8fbff] to-white px-4 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Amount to pay
            </p>
            <p className="mt-1 text-[2rem] font-extrabold leading-none tracking-tight text-zinc-900">
              {formatMoney(amount)}
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <StatusIcon phase={phase} />

            <p
              className={[
                "mt-5 min-h-[2.75rem] max-w-[16rem] text-center text-sm font-semibold leading-snug transition-colors",
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
          </div>

          {isProcessing ? (
            <div className="mt-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e8f4ff]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#007dfe] to-[#00a3ff] transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
                />
              </div>
              <p className="mt-3 text-center text-[11px] font-medium text-[var(--color-text-muted)]">
                Processing payment…
              </p>
            </div>
          ) : (
            <div
              className={[
                "mt-5 h-1.5 overflow-hidden rounded-full",
                isError ? "bg-rose-100" : "bg-emerald-100",
              ].join(" ")}
            >
              <div
                className={[
                  "h-full w-full rounded-full",
                  isError ? "bg-rose-500" : "bg-emerald-500",
                ].join(" ")}
              />
            </div>
          )}

          <p className="mt-5 text-center text-[10px] leading-relaxed text-[var(--color-text-muted)]">
            {isProcessing
              ? "Please keep this page open while we confirm your payment."
              : "You may close this dialog once checkout continues."}
          </p>
        </div>
      </div>
    </div>
  );
}
