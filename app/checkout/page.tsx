import { Suspense } from "react";
import { OrderingGuard } from "../../components/ordering/OrderingGuard";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)]">
          <header className="border-b border-[var(--color-surface-line)] bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold text-zinc-700">Back</span>
              <div className="text-base font-extrabold text-[var(--color-primary)]">
                Checkout
              </div>
              <div className="w-[90px]" />
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl px-4 py-6">
            <div className="rounded-2xl bg-white p-6 text-sm text-zinc-600">
              Loading…
            </div>
          </main>
        </div>
      }
    >
      <OrderingGuard>
        <CheckoutClient />
      </OrderingGuard>
    </Suspense>
  );
}

