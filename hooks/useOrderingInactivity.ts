"use client";

import { useEffect } from "react";
import { getOrCreateDeviceId } from "@/lib/device-session";
import { QR_BINDING_HEARTBEAT_INTERVAL_MS } from "@/lib/qr-binding-heartbeat";
import {
  isClientOrderingInactive,
  touchOrderingActivity,
} from "@/lib/ordering-activity";
import {
  endOrderingSessionDueToInactivity,
  QR_ORDER_INACTIVITY_MESSAGE,
} from "@/lib/qr-session-end";
import { isAdminPath } from "@/lib/routes";
import { hasTableFromQr, isQrOrderEnforcedOnClient } from "@/lib/table";

const CHECK_INTERVAL_MS = 15_000;

export function useOrderingInactivity(onExpired: (message: string) => void) {
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
        await endOrderingSessionDueToInactivity();
        onExpired(QR_ORDER_INACTIVITY_MESSAGE);
      }
    }

    async function expireIfNeeded() {
      if (!hasTableFromQr()) return;
      if (!isClientOrderingInactive()) return;
      await endOrderingSessionDueToInactivity();
      onExpired(QR_ORDER_INACTIVITY_MESSAGE);
    }

    function onUserActivity() {
      touchOrderingActivity();
      const now = Date.now();
      if (now - lastPingAt >= QR_BINDING_HEARTBEAT_INTERVAL_MS) {
        lastPingAt = now;
        void pingServerActivity();
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible") {
        touchOrderingActivity();
        void expireIfNeeded();
      }
    }

    touchOrderingActivity();
    void pingServerActivity();
    lastPingAt = Date.now();

    const activityOptions = { passive: true } as const;
    window.addEventListener("pointerdown", onUserActivity, activityOptions);
    window.addEventListener("touchstart", onUserActivity, activityOptions);
    window.addEventListener("touchmove", onUserActivity, activityOptions);
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("scroll", onUserActivity, activityOptions);
    window.addEventListener("click", onUserActivity, activityOptions);
    document.addEventListener("visibilitychange", onVisible);

    const checkInterval = window.setInterval(() => {
      void expireIfNeeded();
    }, CHECK_INTERVAL_MS);

    const heartbeatInterval = window.setInterval(() => {
      if (!hasTableFromQr()) return;
      const now = Date.now();
      if (now - lastPingAt >= QR_BINDING_HEARTBEAT_INTERVAL_MS) {
        lastPingAt = now;
        void pingServerActivity();
      }
    }, QR_BINDING_HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener("pointerdown", onUserActivity);
      window.removeEventListener("touchstart", onUserActivity);
      window.removeEventListener("touchmove", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("scroll", onUserActivity);
      window.removeEventListener("click", onUserActivity);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(checkInterval);
      window.clearInterval(heartbeatInterval);
    };
  }, [onExpired]);
}
