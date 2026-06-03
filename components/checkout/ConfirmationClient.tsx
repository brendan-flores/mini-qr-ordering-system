"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { orderTrackUrl } from "@/lib/checkout-url";
import { MENU_PAGE_PATH } from "@/lib/routes";

/** Legacy URL — forwards to order tracking. */
export default function ConfirmationClient() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const returnTo = params.get("return");
  const homePath = returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH;

  useEffect(() => {
    if (orderId) {
      router.replace(
        orderTrackUrl(orderId, { placed: true, returnTo: homePath })
      );
      return;
    }
    router.replace(MENU_PAGE_PATH);
  }, [orderId, router, homePath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-zinc-600">
      Redirecting…
    </div>
  );
}
