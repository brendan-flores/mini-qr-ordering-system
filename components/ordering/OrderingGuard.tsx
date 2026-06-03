"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { useTable } from "../table/TableProvider";

export function OrderingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { orderingEnabled } = useTable();

  useEffect(() => {
    if (!orderingEnabled) {
      router.replace(MENU_PAGE_PATH);
    }
  }, [orderingEnabled, router]);

  if (!orderingEnabled) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-zinc-600">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
