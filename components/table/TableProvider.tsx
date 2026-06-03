"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  hasOrderingSession,
  markOrderingSession,
  normalizeTableNumber,
  resolveTableNumber,
  subscribeToOrdering,
  tableNumberFromUrl,
} from "@/lib/table";

type TableContextValue = {
  orderingEnabled: boolean;
  tableNumber: string;
  setTableNumber: (value: string) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

export function TableProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("table");
  const tableFromUrl = normalizeTableNumber(fromUrl);

  useEffect(() => {
    if (tableFromUrl) {
      markOrderingSession(tableFromUrl);
    }
  }, [tableFromUrl]);

  const orderingEnabled = useSyncExternalStore(
    subscribeToOrdering,
    () => !!tableFromUrl || hasOrderingSession(),
    () => !!tableFromUrl
  );

  const tableNumber = useSyncExternalStore(
    subscribeToOrdering,
    () => (orderingEnabled ? resolveTableNumber(fromUrl) : "1"),
    () => tableNumberFromUrl(fromUrl) ?? "1"
  );

  const value = useMemo(
    () => ({
      orderingEnabled,
      tableNumber,
      setTableNumber: (value: string) => {
        const trimmed = value.trim() || "1";
        markOrderingSession(trimmed);
      },
    }),
    [orderingEnabled, tableNumber]
  );

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
}

export function useTable() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error("useTable must be used within TableProvider");
  }
  return ctx;
}
