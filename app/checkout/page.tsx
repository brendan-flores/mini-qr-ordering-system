import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <header className="border-b border-black/5 bg-white">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
              <span className="text-sm font-semibold text-zinc-700">Back</span>
              <div className="text-base font-extrabold text-rose-700">
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
      <CheckoutClient />
    </Suspense>
  );
}

