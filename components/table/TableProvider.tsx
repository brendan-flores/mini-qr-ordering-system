"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  allowsMenuOrderingWithoutTable,
  hasOrderingSession,
  hasTableFromQr,
  markMenuOrderingSession,
  markOrderingSessionFromQr,
  normalizeTableNumber,
  resolveTableNumber,
  subscribeToOrdering,
  tableNumberFromUrl,
} from "@/lib/table";

type TableContextValue = {
  orderingEnabled: boolean;
  /** Table label only after scanning a table QR. */
  hasTableFromQr: boolean;
  tableNumber: string;
  setTableNumber: (value: string) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

function readOrderingEnabled(
  tableFromUrl: string | null,
  pathname: string
): boolean {
  if (tableFromUrl) return true;
  if (allowsMenuOrderingWithoutTable(pathname)) return true;
  return hasOrderingSession();
}

function readHasTableFromQr(tableFromUrl: string | null): boolean {
  if (tableFromUrl) return true;
  return hasTableFromQr();
}

export function TableProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("table");
  const tableFromUrl = normalizeTableNumber(fromUrl);

  useEffect(() => {
    if (tableFromUrl) {
      markOrderingSessionFromQr(tableFromUrl);
      return;
    }
    if (allowsMenuOrderingWithoutTable(pathname) && !hasTableFromQr()) {
      markMenuOrderingSession();
    }
  }, [tableFromUrl, pathname]);

  const orderingEnabled = useSyncExternalStore(
    subscribeToOrdering,
    () => readOrderingEnabled(tableFromUrl, pathname),
    () => !!tableFromUrl
  );

  const tableFromQr = useSyncExternalStore(
    subscribeToOrdering,
    () => readHasTableFromQr(tableFromUrl),
    () => !!tableFromUrl
  );

  const tableNumber = useSyncExternalStore(
    subscribeToOrdering,
    () => (tableFromQr ? resolveTableNumber(fromUrl) : ""),
    () => tableNumberFromUrl(fromUrl) ?? ""
  );

  const value = useMemo(
    () => ({
      orderingEnabled,
      hasTableFromQr: tableFromQr,
      tableNumber,
      setTableNumber: (value: string) => {
        markOrderingSessionFromQr(value);
      },
    }),
    [orderingEnabled, tableFromQr, tableNumber]
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
