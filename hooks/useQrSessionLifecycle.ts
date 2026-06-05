"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  endQrOrderingSession,
  releaseQrSessionOnUnload,
} from "@/lib/qr-session-end";
import { isQrOrderingFlowPath } from "@/lib/qr-session-flow";
import {
  hasActiveQrBinding,
  hasTableFromQr,
  isQrOrderEnforcedOnClient,
} from "@/lib/table";

function sessionShouldEnd(): boolean {
  return hasTableFromQr() || hasActiveQrBinding();
}

/**
 * End the table-QR session when the guest closes a tab/browser or navigates
 * completely outside the ordering flow. Bare menu visits restore an active
 * server session via TableProvider instead of ending here.
 */
export function useQrSessionLifecycle() {
  const pathname = usePathname();
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

    function onFreeze() {
      notifyUnloadOnce();
    }

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("freeze", onFreeze);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("freeze", onFreeze);
    };
  }, []);

  useEffect(() => {
    if (!isQrOrderEnforcedOnClient()) return;
    if (!sessionShouldEnd()) return;

    const previousPath = prevPathRef.current;
    prevPathRef.current = pathname;

    const leftOrderingFlow =
      previousPath !== pathname &&
      isQrOrderingFlowPath(previousPath) &&
      !isQrOrderingFlowPath(pathname);

    if (leftOrderingFlow) {
      void endQrOrderingSession();
    }
  }, [pathname]);
}
