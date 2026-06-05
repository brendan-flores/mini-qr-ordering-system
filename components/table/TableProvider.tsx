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
import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  allowsMenuOrderingWithoutTable,
  clearOrderingSession,
  getStoredTableNumber,
  hasTableFromQr,
  isQrOrderEnforcedOnClient,
  markMenuOrderingSession,
  markOrderingSessionFromQr,
  normalizeTableNumber,
  resolveScannedTableNumber,
  subscribeToOrdering,
} from "@/lib/table";

type TableContextValue = {
  orderingEnabled: boolean;
  /** Table label only after scanning a table QR. */
  hasTableFromQr: boolean;
  tableNumber: string;
  setTableNumber: (value: string) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

function readOrderingEnabled(): boolean {
  if (!isQrOrderEnforcedOnClient()) return true;
  return hasTableFromQr();
}

function readHasTableFromQr(): boolean {
  return hasTableFromQr();
}

async function syncQrSessionFromServer(
  tableFromUrl: string | null
): Promise<boolean> {
  const params = new URLSearchParams();
  const deviceId = getOrCreateDeviceId();
  if (deviceId) params.set("device_id", deviceId);

  const res = await fetch(
    `/api/qr/session${params.size ? `?${params}` : ""}`,
    { credentials: "include" }
  );
  if (!res.ok) return false;

  const data = (await res.json()) as { active?: boolean; table?: string };
  if (!data.active || !data.table) return false;

  if (tableFromUrl && data.table !== tableFromUrl) return false;

  markOrderingSessionFromQr(data.table);
  return true;
}

export function TableProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("table");
  const accessFromUrl = searchParams.get("access")?.trim() ?? null;
  const tableFromUrl = normalizeTableNumber(fromUrl);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      if (!isQrOrderEnforcedOnClient()) {
        if (tableFromUrl) {
          markOrderingSessionFromQr(tableFromUrl);
          return;
        }
        if (allowsMenuOrderingWithoutTable(pathname) && !hasTableFromQr()) {
          markMenuOrderingSession();
        }
        return;
      }

      if (tableFromUrl && accessFromUrl) {
        const deviceId = getOrCreateDeviceId();
        const params = new URLSearchParams({
          table: tableFromUrl,
          access: accessFromUrl,
        });
        if (deviceId) params.set("device_id", deviceId);
        const res = await fetch(`/api/qr/activate?${params}`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as { ok?: boolean };
          if (data.ok) {
            markOrderingSessionFromQr(tableFromUrl);
            return;
          }
        }
        clearOrderingSession();
        return;
      }

      const stored = getStoredTableNumber();
      if (tableFromUrl && stored && tableFromUrl !== stored) {
        clearOrderingSession();
        return;
      }

      const active = await syncQrSessionFromServer(tableFromUrl);
      if (cancelled) return;
      if (!active) {
        clearOrderingSession();
      }
    }

    void syncSession();
    return () => {
      cancelled = true;
    };
  }, [tableFromUrl, accessFromUrl, pathname]);

  const orderingEnabled = useSyncExternalStore(
    subscribeToOrdering,
    () => readOrderingEnabled(),
    () => process.env.NODE_ENV === "development"
  );

  const tableFromQr = useSyncExternalStore(
    subscribeToOrdering,
    () => readHasTableFromQr(),
    () => process.env.NODE_ENV === "development"
  );

  const tableNumber = useSyncExternalStore(
    subscribeToOrdering,
    () => (tableFromQr ? resolveScannedTableNumber(fromUrl) : ""),
    () => ""
  );

  const value = useMemo(
    () => ({
      orderingEnabled,
      hasTableFromQr: tableFromQr,
      tableNumber,
      setTableNumber: (value: string) => {
        if (!isQrOrderEnforcedOnClient()) {
          markOrderingSessionFromQr(value);
        }
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
