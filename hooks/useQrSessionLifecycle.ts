"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  endQrOrderingSession,
  releaseQrSessionOnUnload,
} from "@/lib/qr-session-end";
import {
  isBareMenuVisit,
  isQrOrderingFlowPath,
} from "@/lib/qr-session-flow";
import {
  hasActiveQrBinding,
  hasTableFromQr,
  isQrOrderEnforcedOnClient,
  normalizeTableNumber,
} from "@/lib/table";

function sessionShouldEnd(): boolean {
  return hasTableFromQr() || hasActiveQrBinding();
}

/**
 * End the table-QR session when the guest closes a tab/browser or leaves the
 * ordering flow. Same rules on localhost, LAN IP, and production.
 */
export function useQrSessionLifecycle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tableFromUrl = normalizeTableNumber(searchParams.get("table"));
  const accessFromUrl = searchParams.get("access")?.trim() ?? null;
  const prevPathRef = useRef(pathname);
  const unloadNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isQrOrderEnforcedOnClient()) return;

    function notifyUnloadOnce() {
      if (unloadNotifiedRef.current) return;
      if (!sessionShouldEnd()) return;
      unloadNotifiedRef.current = true;
      releaseQrSessionOnUnload();
    }

    function onPageHide(event: PageTransitionEvent) {
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

    const leftOrderingFlow =
      previousPath !== pathname &&
      isQrOrderingFlowPath(previousPath) &&
      !isQrOrderingFlowPath(pathname);

    const onBareMenu =
      sessionShouldEnd() &&
      isBareMenuVisit(pathname, tableFromUrl, accessFromUrl);

    if (leftOrderingFlow || onBareMenu) {
      void endQrOrderingSession();
    }
  }, [pathname, tableFromUrl, accessFromUrl]);
}
