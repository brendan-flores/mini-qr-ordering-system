"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { useOrderingInactivity } from "@/hooks/useOrderingInactivity";
import { useQrSessionLifecycle } from "@/hooks/useQrSessionLifecycle";
import { getOrCreateDeviceId } from "@/lib/device-session";
import {
  clearLocalOrderingSession,
  endQrOrderingSession,
} from "@/lib/qr-session-end";
import {
  allowsMenuOrderingWithoutTable,
  clearOrderingSession,
  getStoredTableNumber,
  hasTableFromQr,
  markOrderingSessionFromQr,
  normalizeTableNumber,
  resolveScannedTableNumber,
  subscribeToOrdering,
} from "@/lib/table";

type TableContextValue = {
  orderingEnabled: boolean;
  hasTableFromQr: boolean;
  tableNumber: string;
  qrActivationMessage: string | null;
  setTableNumber: (value: string) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

function readOrderingEnabled(): boolean {
  return hasTableFromQr();
}

function readHasTableFromQr(): boolean {
  return hasTableFromQr();
}

async function requestQrActivate(params: URLSearchParams) {
  const deviceId = getOrCreateDeviceId();
  if (deviceId) params.set("device_id", deviceId);
  return fetch(`/api/qr/activate?${params}`, { credentials: "include" });
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
  const mounted = useMounted();
  const [qrActivationMessage, setQrActivationMessage] = useState<string | null>(
    null
  );

  const handleSessionExpired = useCallback((message: string) => {
    setQrActivationMessage(message);
  }, []);

  useOrderingInactivity(handleSessionExpired);
  useQrSessionLifecycle();

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      const hasQrCredential = Boolean(tableFromUrl && accessFromUrl);

      // Menu without ?table=&access= in the URL — restore an in-progress session
      // from the server cookie (e.g. "Order more", header Menu link). Do not
      // release the QR binding while the guest is still in the ordering flow.
      if (allowsMenuOrderingWithoutTable(pathname) && !hasQrCredential) {
        const hadClientSession = hasTableFromQr();
        const restored = await syncQrSessionFromServer(null);
        if (cancelled) return;
        if (restored) {
          setQrActivationMessage(null);
          return;
        }

        if (hadClientSession) {
          clearLocalOrderingSession();
        } else {
          clearOrderingSession();
        }
        setQrActivationMessage(null);
        return;
      }

      if (hasQrCredential) {
        const params = new URLSearchParams();
        if (tableFromUrl) params.set("table", tableFromUrl);
        if (accessFromUrl) params.set("access", accessFromUrl);

        const res = await requestQrActivate(params);
        if (cancelled) return;

        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          error?: string;
          table?: string;
        } | null;

        if (res.ok && data?.ok) {
          setQrActivationMessage(null);
          markOrderingSessionFromQr(data.table ?? tableFromUrl ?? "");
          return;
        }

        if (data?.error) {
          setQrActivationMessage(data.error);
        } else {
          setQrActivationMessage(
            "Could not verify this table QR. Ask staff for a newly printed code."
          );
        }

        const restored = await syncQrSessionFromServer(tableFromUrl);
        if (cancelled) return;
        if (restored) {
          setQrActivationMessage(null);
          return;
        }

        if (data?.error?.includes("another device")) {
          clearLocalOrderingSession();
          return;
        }

        clearLocalOrderingSession();
        return;
      }

      setQrActivationMessage(null);

      const stored = getStoredTableNumber();
      if (tableFromUrl && stored && tableFromUrl !== stored) {
        clearLocalOrderingSession();
        return;
      }

      const active = await syncQrSessionFromServer(tableFromUrl);
      if (cancelled) return;
      if (!active && hasTableFromQr()) {
        clearLocalOrderingSession();
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
    () => false
  );

  const tableFromQr = useSyncExternalStore(
    subscribeToOrdering,
    () => readHasTableFromQr(),
    () => false
  );

  const tableNumber = useSyncExternalStore(
    subscribeToOrdering,
    () => (tableFromQr ? resolveScannedTableNumber(fromUrl) : ""),
    () => ""
  );

  const value = useMemo(
    () => ({
      orderingEnabled: mounted && orderingEnabled,
      hasTableFromQr: mounted && tableFromQr,
      tableNumber: mounted && tableFromQr ? tableNumber : "",
      qrActivationMessage,
      setTableNumber: () => {},
    }),
    [mounted, orderingEnabled, tableFromQr, tableNumber, qrActivationMessage]
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
