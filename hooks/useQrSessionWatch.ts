"use client";

import { useEffect } from "react";
import {
  QR_SESSION_TERMINATED_MESSAGE,
  QR_SESSION_WATCH_INTERVAL_MS,
} from "@/lib/client/qr/qr-inactivity";
import { fetchQrSessionSnapshot } from "@/lib/client/qr/qr-session-client";
import { handleQrSessionTerminated } from "@/lib/client/qr/qr-session-end";
import { isAdminPath } from "@/lib/shared/config/routes";
import {
  hasActiveQrBinding,
  hasTableFromQr,
  isQrOrderEnforcedOnClient,
} from "@/lib/client/session/table";

/**
 * Polls the server so admin-terminated sessions end on the guest device within
 * a few seconds — without waiting for the inactivity heartbeat.
 */
export function useQrSessionWatch(onTerminated: (message: string) => void) {
  useEffect(() => {
    if (typeof window !== "undefined" && isAdminPath(window.location.pathname)) {
      return;
    }
    if (!isQrOrderEnforcedOnClient()) return;

    let cancelled = false;

    async function check() {
      if (cancelled) return;
      if (!hasTableFromQr() && !hasActiveQrBinding()) return;

      const snapshot = await fetchQrSessionSnapshot();
      if (cancelled) return;

      if (snapshot.status === "terminated") {
        handleQrSessionTerminated();
        onTerminated(QR_SESSION_TERMINATED_MESSAGE);
      }
    }

    void check();

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void check();
    }, QR_SESSION_WATCH_INTERVAL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") void check();
    }

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onTerminated]);
}
