import { Suspense } from "react";
import { OrderingGuard } from "@/components/ordering/OrderingGuard";
import { OrderTrackingClient } from "@/components/orders/OrderTrackingClient";

type Props = { params: Promise<{ id: string }> };

export default async function OrderTrackingPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-zinc-600">
          Loading…
        </div>
      }
    >
      <OrderingGuard>
        <OrderTrackingClient orderId={id} />
      </OrderingGuard>
    </Suspense>
  );
}
