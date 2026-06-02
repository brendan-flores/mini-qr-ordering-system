"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAdminOrders,
  updateOrderPaymentStatus,
  updateOrderStatus,
  type AdminKitchenStatus,
  type Order,
  type PaymentStatus,
} from "../../client/services/orders";
import {
  effectivePaymentStatus,
  isOrderCancelled,
} from "../../lib/orders/order-rules";
import { notifyOrderUpdated } from "../../lib/order-events";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminShell } from "./AdminShell";
import { OrderDetailModal } from "./OrderDetailModal";
import { PaymentStatusTabs, type PaymentTab } from "./PaymentStatusTabs";
import {
  groupOrdersByTable,
  sortedTableKeys,
  TableOrdersSection,
} from "./TableOrdersSection";
import { isOrderLocked } from "./adminUtils";

function matchesTab(order: Order, tab: PaymentTab) {
  if (tab === "Cancelled") return isOrderCancelled(order);
  if (isOrderCancelled(order)) return false;
  return effectivePaymentStatus(order.payment_status) === tab;
}

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

  useEffect(() => {
    refresh();

    function poll() {
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
    }

    const interval = setInterval(poll, 15000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, []);

  const totals = useMemo(
    () => ({
      Pending: orders.filter((o) => matchesTab(o, "Pending")).length,
      Paid: orders.filter((o) => matchesTab(o, "Paid")).length,
      Cancelled: orders.filter((o) => matchesTab(o, "Cancelled")).length,
    }),
    [orders]
  );

  const paymentTabs = useMemo(
    () =>
      (
        [
          { id: "Pending" as const, label: "Pending" },
          { id: "Paid" as const, label: "Paid" },
          { id: "Cancelled" as const, label: "Cancelled" },
        ] as const
      ).map((t) => ({ ...t, count: totals[t.id] })),
    [totals]
  );

  const filtered = useMemo(
    () => orders.filter((o) => matchesTab(o, activeTab)),
    [orders, activeTab]
  );

  const byTable = useMemo(() => groupOrdersByTable(filtered), [filtered]);
  const tableKeys = useMemo(() => sortedTableKeys(byTable), [byTable]);

  const emptyMessage =
    activeTab === "Cancelled"
      ? "No cancelled orders"
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
      if (!matchesTab(data, activeTab)) {
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

    setUpdating(`kitchen-${order.id}`);
    setError(null);
    try {
      const { data } = await updateOrderStatus(order.id, order_status);
      patchOrderInList(data);
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

  return (
    <AdminShell onRefresh={refresh}>
      <main className="mx-auto max-w-[1440px] p-4 pb-28 lg:p-6 lg:pb-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] lg:text-3xl">
              Live Orders
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Payment: Pending or Paid. Kitchen: mark Completed when done.
              Cancelled orders appear when customers cancel.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <MaterialIcon name="refresh" filled={false} className="text-lg" />
            Refresh
          </button>
        </div>

        <section className="mb-8 w-full">
          <PaymentStatusTabs
            tabs={paymentTabs}
            active={activeTab}
            onChange={setActiveTab}
          />
        </section>

        {error ? (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-[var(--color-surface-line)] bg-white p-12 text-center text-sm text-zinc-600">
            Loading orders…
          </div>
        ) : tableKeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-surface-line)] bg-white p-12 text-center">
            <MaterialIcon
              name="receipt_long"
              filled={false}
              className="mx-auto text-5xl text-zinc-300"
            />
            <p className="mt-4 font-semibold text-zinc-900">{emptyMessage}</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {activeTab === "Cancelled"
                ? "Orders cancelled by customers will show here."
                : "New orders will appear here grouped by table."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {tableKeys.map((table) => (
              <TableOrdersSection
                key={table}
                orders={byTable.get(table)!}
                updatingId={updating}
                readOnly={activeTab === "Cancelled"}
                onSelectOrder={setSelectedOrder}
                onPaymentChange={setPayment}
                onKitchenChange={setKitchenStatus}
              />
            ))}
          </div>
        )}
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
