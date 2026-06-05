"use client";

import { useEffect } from "react";
import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  endOrderingSessionDueToInactivity,
  QR_ORDER_INACTIVITY_MESSAGE,
  touchOrderingActivity,
  isClientOrderingInactive,
} from "@/lib/ordering-activity";
import { isAdminPath } from "@/lib/routes";
import { hasTableFromQr, isQrOrderEnforcedOnClient } from "@/lib/table";

const CHECK_INTERVAL_MS = 30_000;
const PING_INTERVAL_MS = 60_000;

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
      if (now - lastPingAt >= PING_INTERVAL_MS) {
        lastPingAt = now;
        void pingServerActivity();
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible") {
        void expireIfNeeded();
      }
    }

    touchOrderingActivity();
    void pingServerActivity();
    lastPingAt = Date.now();

    window.addEventListener("pointerdown", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity);
    window.addEventListener("scroll", onUserActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisible);

    const interval = window.setInterval(() => {
      void expireIfNeeded();
    }, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("pointerdown", onUserActivity);
      window.removeEventListener("keydown", onUserActivity);
      window.removeEventListener("scroll", onUserActivity);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [onExpired]);
}
