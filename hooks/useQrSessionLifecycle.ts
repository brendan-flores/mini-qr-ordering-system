"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  endQrOrderingSession,
  releaseQrSessionOnUnload,
} from "@/lib/qr-session-end";
import { isQrSessionPath } from "@/lib/routes";
import { hasTableFromQr, isQrOrderEnforcedOnClient } from "@/lib/table";

/**
 * Release the table-QR session when the guest closes a tab, closes the entire
 * browser, navigates away from the ordering app, or leaves customer routes.
 */
export function useQrSessionLifecycle() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const unloadNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isQrOrderEnforcedOnClient()) return;

    function notifyUnloadOnce() {
      if (unloadNotifiedRef.current) return;
      unloadNotifiedRef.current = true;
      releaseQrSessionOnUnload();
    }

    function onPageHide(event: PageTransitionEvent) {
      // Skip bfcache restores (e.g. back-forward) — session should stay active.
      if (event.persisted) return;
      notifyUnloadOnce();
    }

    function onBeforeUnload() {
      notifyUnloadOnce();
    }

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!isQrOrderEnforcedOnClient()) return;

    const previousPath = prevPathRef.current;
    prevPathRef.current = pathname;

    if (previousPath === pathname) return;

    const leftSessionRoute =
      isQrSessionPath(previousPath) && !isQrSessionPath(pathname);

    if (leftSessionRoute && hasTableFromQr()) {
      void endQrOrderingSession();
    }
  }, [pathname]);
}
