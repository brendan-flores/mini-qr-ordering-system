"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { isAdminPath } from "@/lib/routes";
import { CartProvider } from "./CartContext";
import { TableProvider } from "../table/TableProvider";

function OrderingProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={null}>
      <TableProvider>{children}</TableProvider>
    </Suspense>
  );
}

export function CartRoot({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <OrderingProviders>{children}</OrderingProviders>
    </CartProvider>
  );
}
