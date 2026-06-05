"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Order } from "@/client/services/orders";

export type NewOrderNotification = {
  orderId: string;
  order: Order;
  receivedAt: number;
  read: boolean;
};

export function useNewOrderNotifications(
  orders: Order[],
  options: { enabled: boolean }
) {
  const knownIdsRef = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);
  const [notifications, setNotifications] = useState<NewOrderNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!options.enabled) return;

    const currentIds = new Set(orders.map((o) => String(o.id)));

    if (!seededRef.current) {
      knownIdsRef.current = currentIds;
      seededRef.current = true;
      return;
    }

    const fresh = orders.filter((o) => !knownIdsRef.current.has(String(o.id)));
    if (fresh.length === 0) return;

    const now = Date.now();
    setNotifications((prev) => {
      const existing = new Set(prev.map((n) => n.orderId));
      const added = fresh
        .filter((o) => !existing.has(String(o.id)))
        .map((order) => ({
          orderId: String(order.id),
          order,
          receivedAt: now,
          read: false,
        }));
      return [...added, ...prev];
    });

    for (const id of currentIds) {
      knownIdsRef.current.add(id);
    }
  }, [orders, options.enabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((orderId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.orderId === orderId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return {
    notifications,
    unreadCount,
    open,
    setOpen,
    markRead,
    markAllRead,
  };
}
