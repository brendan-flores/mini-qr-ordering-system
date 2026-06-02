import type { OrderStatus } from "../../client/services/orders";
import { orderStatusLabel } from "../../client/services/orders";

const styles: Record<OrderStatus, string> = {
  received: "bg-sky-100 text-sky-900",
  preparing: "bg-amber-100 text-amber-900",
  serving: "bg-violet-100 text-violet-900",
  served: "bg-emerald-100 text-emerald-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const value = status ?? "received";
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[value],
      ].join(" ")}
    >
      {orderStatusLabel(value)}
    </span>
  );
}
