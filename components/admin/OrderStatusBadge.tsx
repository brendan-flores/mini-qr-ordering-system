import type { OrderStatus } from "../../client/services/orders";
import { orderStatusLabel } from "../../client/services/orders";
import { KITCHEN_BADGE_STYLES } from "./adminStatusStyles";

const styles: Record<OrderStatus, string> = {
  ...KITCHEN_BADGE_STYLES,
  cancelled:
    "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] ring-[var(--color-surface-line)]",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const value = status ?? "received";
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
        styles[value],
      ].join(" ")}
    >
      {orderStatusLabel(value)}
    </span>
  );
}
