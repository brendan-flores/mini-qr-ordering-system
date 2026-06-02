"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  persistTableNumber,
  resolveTableNumber,
  subscribeToTable,
  tableNumberFromUrl,
} from "@/lib/table";

type TableContextValue = {
  tableNumber: string;
  setTableNumber: (value: string) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

export function TableProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("table");

  const tableNumber = useSyncExternalStore(
    subscribeToTable,
    () => resolveTableNumber(fromUrl),
    () => tableNumberFromUrl(fromUrl)
  );

  const value = useMemo(
    () => ({
      tableNumber,
      setTableNumber: (value: string) => {
        const trimmed = value.trim() || "1";
        persistTableNumber(trimmed);
      },
    }),
    [tableNumber]
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
