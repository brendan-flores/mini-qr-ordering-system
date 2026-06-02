"use client";

import { Suspense } from "react";
import { CartProvider } from "./CartContext";
import { TableProvider } from "../table/TableProvider";

export function CartRoot({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Suspense fallback={null}>
        <TableProvider>{children}</TableProvider>
      </Suspense>
    </CartProvider>
  );
}
