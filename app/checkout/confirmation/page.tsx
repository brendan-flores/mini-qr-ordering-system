import { Suspense } from "react";
import { OrderingGuard } from "../../../components/ordering/OrderingGuard";
import ConfirmationClient from "../../../components/checkout/ConfirmationClient";

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-zinc-600">
          Loading…
        </div>
      }
    >
      <OrderingGuard>
        <ConfirmationClient />
      </OrderingGuard>
    </Suspense>
  );
}
