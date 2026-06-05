"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  endQrOrderingSession,
  releaseQrSessionOnUnload,
} from "@/lib/qr-session-end";
import { isQrOrderingFlowPath } from "@/lib/qr-session-flow";
import { logQrSession } from "@/lib/qr-session-log";
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
 * completely outside the ordering flow. Bare menu visits do NOT end the session
 * here — TableProvider restores an active server session instead.
 */
export function useQrSessionLifecycle() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const unloadNotifiedRef = useRef(false);

  useEffect(() => {
    if (!isQrOrderEnforcedOnClient()) return;

    function notifyUnloadOnce(reason: string) {
      if (unloadNotifiedRef.current) return;
      if (!sessionShouldEnd()) return;
      unloadNotifiedRef.current = true;
      logQrSession("unload_event", { reason });
      releaseQrSessionOnUnload();
    }

    function onPageHide(event: PageTransitionEvent) {
      if (event.persisted) return;
      notifyUnloadOnce("pagehide");
    }

    function onBeforeUnload() {
      notifyUnloadOnce("beforeunload");
    }

    function onFreeze() {
      notifyUnloadOnce("freeze");
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
      logQrSession("left_ordering_flow", { from: previousPath, to: pathname });
      void endQrOrderingSession();
    }
  }, [pathname]);
}
