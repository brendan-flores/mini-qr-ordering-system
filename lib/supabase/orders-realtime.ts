"use client";

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./browser";

export type OrdersRealtimeScope =
  | "admin"
  | { orderId: string }
  | { orderIds: string[] };

function rowIdFromPayload(
  payload: RealtimePostgresChangesPayload<{ id: string }>
): string | undefined {
  const row = payload.new as { id?: string } | null;
  const old = payload.old as { id?: string } | null;
  const id = row?.id ?? old?.id;
  return id != null ? String(id) : undefined;
}

function onOrdersChange(
  payload: RealtimePostgresChangesPayload<{ id: string }>,
  scope: OrdersRealtimeScope,
  notify: () => void
) {
  if (scope === "admin") {
    notify();
    return;
  }
  const rowId = rowIdFromPayload(payload);
  if (!rowId) return;
  if ("orderId" in scope) {
    if (rowId === scope.orderId) notify();
    return;
  }
  if (scope.orderIds.some((id) => String(id) === rowId)) notify();
}

/**
 * Subscribes to Postgres changes on `orders` for instant UI updates.
 * Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
 * supabase/patch-orders-realtime.sql applied in the Supabase project.
 */
export function subscribeOrdersRealtime(options: {
  scope: OrdersRealtimeScope;
  onChange: () => void;
}): () => void {
  const supabase = getSupabaseBrowser();
  if (!supabase) return () => {};

  const { scope, onChange } = options;
  let channel: RealtimeChannel;

  const handler = (payload: RealtimePostgresChangesPayload<{ id: string }>) => {
    onOrdersChange(payload, scope, onChange);
  };

  if (scope === "admin") {
    channel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        handler
      );
  } else if ("orderId" in scope) {
    channel = supabase
      .channel(`orders-one-${scope.orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${scope.orderId}`,
        },
        handler
      );
  } else {
    const ids = scope.orderIds.filter(Boolean);
    if (ids.length === 0) return () => {};

    channel = supabase.channel(`orders-list-${ids.length}`);
    for (const id of ids) {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        handler
      );
    }
  }

  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
