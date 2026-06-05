"use client";

import { useEffect, useRef } from "react";
import type { Order } from "@/client/services/orders";
import { formatMoney } from "../cart/cartUtils";
import { MaterialIcon } from "../ui/MaterialIcon";
import type { NewOrderNotification } from "@/hooks/useNewOrderNotifications";
import { orderLocationLabel, shortOrderId } from "./adminUtils";

function formatNotificationTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminOrderNotifications({
  notifications,
  unreadCount,
  open,
  onOpenChange,
  onSelectOrder,
  onMarkAllRead,
}: {
  notifications: NewOrderNotification[];
  unreadCount: number;
  open: boolean;
  onOpenChange(open: boolean): void;
  onSelectOrder(order: Order): void;
  onMarkAllRead(): void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onOpenChange]);

  function toggleOpen() {
    const next = !open;
    onOpenChange(next);
    if (next && unreadCount > 0) {
      onMarkAllRead();
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-surface-line)] bg-white text-[var(--color-text-muted)] shadow-sm transition hover:border-[var(--color-primary)]/25 hover:text-[var(--color-primary)]"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} new order notification${unreadCount === 1 ? "" : "s"}`
            : "Order notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <MaterialIcon
          name="notifications"
          filled={unreadCount > 0}
          className="text-[22px]"
        />
        {unreadCount > 0 ? (
          <span className="admin-animate-count-pop absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--color-surface-line)] bg-[#ffffff] shadow-[0_16px_48px_rgba(18,28,42,0.18)] max-sm:fixed max-sm:left-1/2 max-sm:right-auto max-sm:top-[calc(3.75rem+env(safe-area-inset-top))] max-sm:mt-0 max-sm:-translate-x-1/2 sm:translate-x-0"
          role="menu"
          aria-label="New order notifications"
        >
          <div className="border-b border-[var(--color-surface-line)] bg-[#ffffff] px-4 py-3 text-center sm:text-left">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              New orders
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Only new incoming orders
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-[#ffffff] px-4 py-8 text-center">
              <MaterialIcon
                name="notifications_none"
                filled={false}
                className="mx-auto text-3xl text-zinc-200"
              />
              <p className="mt-2 text-sm font-medium text-zinc-700">
                No new orders yet
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                You&apos;ll be notified when a customer places an order.
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(18rem,50dvh)] overflow-y-auto bg-[#ffffff] py-1">
              {notifications.map((notification) => {
                const { order } = notification;
                return (
                  <li key={notification.orderId}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelectOrder(order);
                        onOpenChange(false);
                      }}
                      className="flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-primary-soft)]/40"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <MaterialIcon name="receipt_long" className="text-lg" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                            {orderLocationLabel(order)}
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                            {formatMoney(order.total_amount)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
                          {shortOrderId(order.id)} ·{" "}
                          {formatNotificationTime(order.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
