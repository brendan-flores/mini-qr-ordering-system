"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAdminOrders,
  updateOrderPaymentStatus,
  updateOrderStatus,
  type AdminKitchenStatus,
  type Order,
  type PaymentStatus,
} from "@/lib/client/api/orders";
import {
  canMarkKitchenCompleted,
  effectivePaymentStatus,
  isOrderCancelled,
  KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE,
  matchesAdminPaymentTab,
} from "@/lib/shared/orders/order-rules";
import { notifyOrderUpdated } from "@/lib/client/orders/order-events";
import { useLiveOrderSync } from "@/hooks/useLiveOrderSync";
import { useNewOrderNotifications } from "@/hooks/useNewOrderNotifications";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminOrderNotifications } from "./AdminOrderNotifications";
import { AdminShell } from "./AdminShell";
import { LiveOrdersHeader } from "./LiveOrdersHeader";
import { LiveOrdersSection } from "./LiveOrdersSection";
import { OrderDetailModal } from "./OrderDetailModal";
import { PaymentStatusTabs, type PaymentTab } from "./PaymentStatusTabs";
import {
  FlatLiveOrdersBoard,
  KitchenLiveOrdersBoard,
} from "./LiveOrdersBoard";
import { isOrderLocked } from "@/lib/client/admin/admin-utils";

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PaymentTab>("Pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listAdminOrders();
      setOrders(data);
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return data.find((o) => String(o.id) === String(prev.id)) ?? null;
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const syncOrders = useCallback(() => {
    if (document.visibilityState !== "visible") return;
    listAdminOrders()
      .then(({ data }) => {
        setOrders(data);
        setSelectedOrder((prev) => {
          if (!prev) return null;
          return data.find((o) => String(o.id) === String(prev.id)) ?? null;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    void refresh();
  }, []);

  useLiveOrderSync(syncOrders, { scopeKey: "admin" });

  const {
    notifications,
    unreadCount,
    open: notificationsOpen,
    setOpen: setNotificationsOpen,
    markAllRead,
  } = useNewOrderNotifications(orders, { enabled: !loading });

  const totals = useMemo(
    () => ({
      Pending: orders.filter((o) => matchesAdminPaymentTab(o, "Pending")).length,
      Paid: orders.filter((o) => matchesAdminPaymentTab(o, "Paid")).length,
      Completed: orders.filter((o) => matchesAdminPaymentTab(o, "Completed"))
        .length,
      Cancelled: orders.filter((o) => matchesAdminPaymentTab(o, "Cancelled"))
        .length,
    }),
    [orders]
  );

  const paymentTabs = useMemo(
    () =>
      (
        [
          { id: "Pending" as const, label: "Pending" },
          { id: "Paid" as const, label: "Paid" },
          { id: "Completed" as const, label: "Completed" },
          { id: "Cancelled" as const, label: "Cancelled" },
        ] as const
      ).map((t) => ({ ...t, count: totals[t.id] })),
    [totals]
  );

  const filtered = useMemo(
    () => orders.filter((o) => matchesAdminPaymentTab(o, activeTab)),
    [orders, activeTab]
  );

  const showKitchenBoard =
    activeTab === "Pending" || activeTab === "Paid";

  const emptyMessage =
    activeTab === "Cancelled"
      ? "No cancelled orders"
      : activeTab === "Completed"
        ? "No completed orders"
        : `No ${activeTab.toLowerCase()} orders`;

  function patchOrderInList(data: Order) {
    setOrders((prev) =>
      prev.map((o) => (String(o.id) === String(data.id) ? data : o))
    );
    setSelectedOrder((prev) =>
      prev && String(prev.id) === String(data.id) ? data : prev
    );
    notifyOrderUpdated();
  }

  async function setPayment(order: Order, payment_status: PaymentStatus) {
    if (isOrderLocked(order) || isOrderCancelled(order)) return;
    if (effectivePaymentStatus(order.payment_status) === payment_status) return;

    setUpdating(`payment-${order.id}`);
    setError(null);
    try {
      const { data } = await updateOrderPaymentStatus(order.id, payment_status);
      patchOrderInList(data);
      if (!matchesAdminPaymentTab(data, activeTab)) {
        setSelectedOrder(null);
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update payment status";
      setError(message);
    } finally {
      setUpdating(null);
    }
  }

  async function setKitchenStatus(
    order: Order,
    order_status: AdminKitchenStatus
  ) {
    if (isOrderLocked(order) || isOrderCancelled(order)) return;
    if (order_status === (order.order_status ?? "received")) return;
    if (
      order_status === "completed" &&
      !canMarkKitchenCompleted(order)
    ) {
      setError(KITCHEN_COMPLETED_REQUIRES_PAID_MESSAGE);
      return;
    }

    setUpdating(`kitchen-${order.id}`);
    setError(null);
    try {
      const { data } = await updateOrderStatus(order.id, order_status);
      patchOrderInList(data);
      if (!matchesAdminPaymentTab(data, activeTab)) {
        setSelectedOrder(null);
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update kitchen status";
      setError(message);
    } finally {
      setUpdating(null);
    }
  }

  const selectedUpdating =
    selectedOrder &&
    (updating === `payment-${selectedOrder.id}` ||
      updating === `kitchen-${selectedOrder.id}`);

  function openOrderFromNotification(order: Order) {
    const tabs: PaymentTab[] = ["Pending", "Paid", "Completed", "Cancelled"];
    const tab = tabs.find((t) => matchesAdminPaymentTab(order, t)) ?? "Pending";
    setActiveTab(tab);
    setSelectedOrder(order);
  }

  return (
    <AdminShell>
      <main className="admin-live mx-auto max-w-[1440px] space-y-4 p-3 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:space-y-5 sm:p-4 sm:pb-24 lg:space-y-6 lg:p-6 lg:pb-6">
        <LiveOrdersSection
          header={
            <LiveOrdersHeader
              activeTab={activeTab}
              trailing={
                <AdminOrderNotifications
                  notifications={notifications}
                  unreadCount={unreadCount}
                  open={notificationsOpen}
                  onOpenChange={setNotificationsOpen}
                  onSelectOrder={openOrderFromNotification}
                  onMarkAllRead={markAllRead}
                />
              }
            />
          }
          filters={
            <div className="admin-animate-fade-up space-y-2" style={{ animationDelay: "80ms" }}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]/70">
                Payment stage
              </p>
              <PaymentStatusTabs
                tabs={paymentTabs}
                active={activeTab}
                onChange={setActiveTab}
              />
            </div>
          }
        >
          <div key={activeTab} className="admin-animate-fade-up min-h-[12rem]">
          {error ? (
            <div
              className="admin-animate-fade-in mx-3 mb-3 mt-3 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-800 sm:mx-4 sm:text-sm"
              role="alert"
            >
              <MaterialIcon
                name="error_outline"
                filled={false}
                className="shrink-0 text-base opacity-80"
              />
              <span>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="admin-animate-fade-in px-4 py-12 text-center sm:py-14">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] motion-reduce:animate-none sm:h-7 sm:w-7" />
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Loading orders…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-animate-fade-up px-4 py-12 text-center sm:px-6 sm:py-14">
              <MaterialIcon
                name="receipt_long"
                filled={false}
                className="mx-auto text-3xl text-zinc-200/90 sm:text-4xl"
              />
              <p className="mt-3 text-sm font-medium text-zinc-800">
                {emptyMessage}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[var(--color-text-muted)]/80">
                {activeTab === "Cancelled"
                  ? "Orders cancelled by customers will show here."
                  : "New orders appear when they match this payment stage."}
              </p>
            </div>
          ) : showKitchenBoard ? (
            <KitchenLiveOrdersBoard
              key={activeTab}
              orders={filtered}
              updatingId={updating}
              progressOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onPaymentChange={setPayment}
              onKitchenChange={setKitchenStatus}
              embedded
            />
          ) : (
            <FlatLiveOrdersBoard
              orders={filtered}
              updatingId={updating}
              readOnly={activeTab === "Cancelled"}
              onSelectOrder={setSelectedOrder}
              onPaymentChange={setPayment}
              onKitchenChange={setKitchenStatus}
              embedded
            />
          )}
          </div>
        </LiveOrdersSection>
      </main>

      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          updating={!!selectedUpdating}
          readOnly={
            activeTab === "Cancelled" || isOrderLocked(selectedOrder)
          }
          onClose={() => setSelectedOrder(null)}
          onPaymentChange={(status) => setPayment(selectedOrder, status)}
          onKitchenChange={(status) => setKitchenStatus(selectedOrder, status)}
        />
      ) : null}
    </AdminShell>
  );
}
