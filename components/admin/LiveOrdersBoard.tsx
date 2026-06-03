"use client";

import { useMemo, useState } from "react";
import type {
  AdminKitchenStatus,
  Order,
  PaymentStatus,
} from "../../client/services/orders";
import { orderStatusLabel } from "../../client/services/orders";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminOrderCard } from "./AdminOrderCard";
import {
  KitchenStatusTabs,
  KITCHEN_LIVE_TAB_STATUSES,
  kitchenLaneFor,
} from "./KitchenStatusTabs";

function isLiveKitchenLane(
  lane: AdminKitchenStatus
): lane is (typeof KITCHEN_LIVE_TAB_STATUSES)[number] {
  return (KITCHEN_LIVE_TAB_STATUSES as readonly AdminKitchenStatus[]).includes(
    lane
  );
}

function buildKitchenCounts(orders: Order[]) {
  const tally = Object.fromEntries(
    KITCHEN_LIVE_TAB_STATUSES.map((lane) => [lane, 0])
  ) as Record<AdminKitchenStatus, number>;
  for (const order of orders) {
    const lane = kitchenLaneFor(order);
    if (isLiveKitchenLane(lane)) {
      tally[lane] += 1;
    }
  }
  return tally;
}

function sortOrdersNewestFirst(orders: Order[]) {
  return [...orders].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function OrderCardGrid({
  orders,
  updatingId,
  readOnly,
  emptyLabel,
  onSelectOrder,
  onPaymentChange,
  onKitchenChange,
}: {
  orders: Order[];
  updatingId: string | null;
  readOnly: boolean;
  emptyLabel: string;
  onSelectOrder(order: Order): void;
  onPaymentChange(order: Order, status: PaymentStatus): void;
  onKitchenChange(order: Order, status: AdminKitchenStatus): void;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-surface-line)]/80 bg-[var(--color-surface-subtle)]/30 px-4 py-8 text-center sm:py-10">
        <MaterialIcon
          name="inbox"
          filled={false}
          className="mx-auto text-3xl text-zinc-300"
        />
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
      {orders.map((order) => {
        const id = String(order.id);
        const updating =
          updatingId === id ||
          updatingId === `kitchen-${id}` ||
          updatingId === `payment-${id}`;
        return (
          <AdminOrderCard
            key={id}
            order={order}
            updating={updating}
            readOnly={readOnly}
            onSelect={() => onSelectOrder(order)}
            onPaymentChange={(status) => onPaymentChange(order, status)}
            onKitchenChange={(status) => onKitchenChange(order, status)}
          />
        );
      })}
    </div>
  );
}

/** Pending / Paid: one full-width board filtered by kitchen stage. */
export function KitchenLiveOrdersBoard({
  orders,
  updatingId,
  readOnly = false,
  embedded = false,
  onSelectOrder,
  onPaymentChange,
  onKitchenChange,
}: {
  orders: Order[];
  updatingId: string | null;
  readOnly?: boolean;
  embedded?: boolean;
  onSelectOrder(order: Order): void;
  onPaymentChange(order: Order, status: PaymentStatus): void;
  onKitchenChange(order: Order, status: AdminKitchenStatus): void;
}) {
  const sorted = useMemo(() => sortOrdersNewestFirst(orders), [orders]);

  const counts = useMemo(() => buildKitchenCounts(sorted), [sorted]);

  const [activeKitchen, setActiveKitchen] =
    useState<AdminKitchenStatus>("received");

  const laneOrders = useMemo(
    () =>
      sorted.filter((o) => {
        const lane = kitchenLaneFor(o);
        return isLiveKitchenLane(lane) && lane === activeKitchen;
      }),
    [sorted, activeKitchen]
  );

  return (
    <section
      className={
        embedded
          ? "w-full overflow-hidden"
          : "w-full overflow-hidden rounded-xl border border-[var(--color-surface-line)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:rounded-2xl"
      }
    >
      <KitchenStatusTabs
        counts={counts}
        active={activeKitchen}
        onChange={setActiveKitchen}
        fullWidth
      />

      <div
        className={[
          "w-full p-3 sm:p-4 lg:p-5",
          embedded ? "bg-[var(--color-surface-subtle)]/20" : "bg-[var(--color-surface-subtle)]/30",
        ].join(" ")}
      >
        <OrderCardGrid
          orders={laneOrders}
          updatingId={updatingId}
          readOnly={readOnly}
          emptyLabel={`No ${orderStatusLabel(activeKitchen).toLowerCase()} orders`}
          onSelectOrder={onSelectOrder}
          onPaymentChange={onPaymentChange}
          onKitchenChange={onKitchenChange}
        />
      </div>
    </section>
  );
}

/** Completed / Cancelled: flat list, no kitchen filter. */
export function FlatLiveOrdersBoard({
  orders,
  updatingId,
  readOnly = false,
  embedded = false,
  onSelectOrder,
  onPaymentChange,
  onKitchenChange,
}: {
  orders: Order[];
  updatingId: string | null;
  readOnly?: boolean;
  embedded?: boolean;
  onSelectOrder(order: Order): void;
  onPaymentChange(order: Order, status: PaymentStatus): void;
  onKitchenChange(order: Order, status: AdminKitchenStatus): void;
}) {
  const sorted = useMemo(() => sortOrdersNewestFirst(orders), [orders]);

  return (
    <section
      className={
        embedded
          ? "w-full p-3 sm:p-4 lg:p-5"
          : "w-full overflow-hidden rounded-xl border border-[var(--color-surface-line)] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:rounded-2xl sm:p-4 lg:p-5"
      }
    >
      <OrderCardGrid
        orders={sorted}
        updatingId={updatingId}
        readOnly={readOnly}
        emptyLabel="No orders"
        onSelectOrder={onSelectOrder}
        onPaymentChange={onPaymentChange}
        onKitchenChange={onKitchenChange}
      />
    </section>
  );
}
