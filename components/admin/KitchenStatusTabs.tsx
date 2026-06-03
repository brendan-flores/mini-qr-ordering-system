"use client";

import type { AdminKitchenStatus } from "../../client/services/orders";
import { orderStatusLabel } from "../../client/services/orders";
import { KITCHEN_STATUS_TONES } from "./adminStatusStyles";
import { FilterTabs } from "./FilterTabs";

/** Shown on Pending / Paid — kitchen work in progress only */
export const KITCHEN_LIVE_TAB_STATUSES: AdminKitchenStatus[] = [
  "received",
  "preparing",
  "serving",
  "served",
];

export const KITCHEN_TAB_STATUSES: AdminKitchenStatus[] = [
  ...KITCHEN_LIVE_TAB_STATUSES,
  "completed",
];

export function kitchenLaneFor(order: {
  order_status?: string | null;
}): AdminKitchenStatus {
  const status = order.order_status ?? "received";
  if (
    status === "preparing" ||
    status === "serving" ||
    status === "served" ||
    status === "completed"
  ) {
    return status;
  }
  return "received";
}

export function KitchenStatusTabs({
  counts,
  active,
  onChange,
  fullWidth = false,
  statuses = KITCHEN_LIVE_TAB_STATUSES,
}: {
  counts: Record<AdminKitchenStatus, number>;
  active: AdminKitchenStatus;
  onChange(status: AdminKitchenStatus): void;
  fullWidth?: boolean;
  statuses?: readonly AdminKitchenStatus[];
}) {
  const tabs = statuses.map((id) => ({
    id,
    label: orderStatusLabel(id),
    count: counts[id],
  }));

  return (
    <FilterTabs
      tabs={tabs}
      active={active}
      onChange={onChange}
      ariaLabel="Filter orders by kitchen status"
      variant="kitchen"
      getTone={(id) => KITCHEN_STATUS_TONES[id]}
      fullWidth={fullWidth}
      kitchenColumnCount={statuses.length}
    />
  );
}
