"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  isClientOrderingInactive,
  touchOrderingActivity,
} from "@/lib/ordering-activity";
import {
  isOrderingInactivitySuspended,
  refreshOrderingInactivitySuspend,
} from "@/lib/ordering-inactivity-suspend";
import { subscribeToOrderUpdates } from "@/lib/order-events";
import { LIVE_ORDER_POLL_MS } from "@/lib/order-polling";
import {
  QR_ACTIVITY_PING_THROTTLE_MS,
  QR_INACTIVITY_CHECK_INTERVAL_MS,
} from "@/lib/qr-inactivity";
import { isQrOrderingFlowPath } from "@/lib/qr-session-flow";
import {
  endOrderingSessionDueToInactivity,
  handleQrSessionTerminated,
  QR_ORDER_INACTIVITY_MESSAGE,
  QR_SESSION_TERMINATED_MESSAGE,
} from "@/lib/qr-session-end";
import { isAdminPath } from "@/lib/routes";
import { hasTableFromQr, isQrOrderEnforcedOnClient } from "@/lib/table";

/** Keep server `last_active_at` fresh while the tab is open and the guest is active. */
const TAB_HEARTBEAT_INTERVAL_MS = 30_000;

export function useOrderingInactivity(onExpired: (message: string) => void) {
  const pathname = usePathname();

  // Navigation within menu / checkout / orders counts as activity.
  useEffect(() => {
    if (typeof window !== "undefined" && isAdminPath(window.location.pathname)) {
      return;
    }
    if (!isQrOrderEnforcedOnClient() || !hasTableFromQr()) return;
    if (!isQrOrderingFlowPath(pathname)) return;
    touchOrderingActivity();
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && isAdminPath(window.location.pathname)) {
      return;
    }
    if (!isQrOrderEnforcedOnClient()) return;

    let lastPingAt = 0;

    async function pingServerActivity() {
      if (!hasTableFromQr()) return;
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) return;

      const params = new URLSearchParams({ device_id: deviceId });
      const res = await fetch(`/api/qr/ping?${params}`, {
        credentials: "include",
      });
      if (res.status === 403 || res.status === 401) {
        const data = (await res.json().catch(() => null)) as {
          terminated?: boolean;
        } | null;
        if (data?.terminated) {
          handleQrSessionTerminated();
          onExpired(QR_SESSION_TERMINATED_MESSAGE);
          return;
        }
        await endOrderingSessionDueToInactivity();
        onExpired(QR_ORDER_INACTIVITY_MESSAGE);
      }
    }

    async function expireIfNeeded() {
      if (!hasTableFromQr()) return;
      if (isOrderingInactivitySuspended()) return;
      if (!isClientOrderingInactive()) return;
      await endOrderingSessionDueToInactivity();
      onExpired(QR_ORDER_INACTIVITY_MESSAGE);
    }

    function onUserActivity() {
      touchOrderingActivity();
      const now = Date.now();
      if (now - lastPingAt >= QR_ACTIVITY_PING_THROTTLE_MS) {
        lastPingAt = now;
        void pingServerActivity();
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible") {
        void expireIfNeeded();
        void pingServerActivity();
      }
    }

    touchOrderingActivity();
    void pingServerActivity();
    lastPingAt = Date.now();

    const passive = { passive: true } as const;
    window.addEventListener("pointerdown", onUserActivity, passive);
    window.addEventListener("touchstart", onUserActivity, passive);
    window.addEventListener("touchmove", onUserActivity, passive);
    window.addEventListener("click", onUserActivity, passive);
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("scroll", onUserActivity, passive);
    window.addEventListener("wheel", onUserActivity, passive);
    document.addEventListener("input", onUserActivity, { capture: true });
    document.addEventListener("visibilitychange", onVisible);

    const inactivityCheck = window.setInterval(() => {
      if (isOrderingInactivitySuspended()) return;
      void expireIfNeeded();
    }, QR_INACTIVITY_CHECK_INTERVAL_MS);

    const tabHeartbeat = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!hasTableFromQr()) return;
      if (
        !isOrderingInactivitySuspended() &&
        isClientOrderingInactive()
      ) {
        void expireIfNeeded();
        return;
      }
      const now = Date.now();
      if (now - lastPingAt >= QR_ACTIVITY_PING_THROTTLE_MS) {
        lastPingAt = now;
        void pingServerActivity();
      }
    }, TAB_HEARTBEAT_INTERVAL_MS);

    void refreshOrderingInactivitySuspend();
    const unsubOrders = subscribeToOrderUpdates(() => {
      void refreshOrderingInactivitySuspend();
    });
    const orderPoll = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshOrderingInactivitySuspend();
      }
    }, LIVE_ORDER_POLL_MS);

    return () => {
      window.removeEventListener("pointerdown", onUserActivity);
      window.removeEventListener("touchstart", onUserActivity);
      window.removeEventListener("touchmove", onUserActivity);
      window.removeEventListener("click", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("scroll", onUserActivity);
      window.removeEventListener("wheel", onUserActivity);
      document.removeEventListener("input", onUserActivity, { capture: true });
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(inactivityCheck);
      window.clearInterval(tabHeartbeat);
      window.clearInterval(orderPoll);
      unsubOrders();
    };
  }, [onExpired]);
}
