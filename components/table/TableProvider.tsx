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
import { useOrderingInactivity } from "@/hooks/useOrderingInactivity";
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
  hasTableFromQr: boolean;
  tableNumber: string;
  qrActivationMessage: string | null;
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
  const codeFromUrl = searchParams.get("code")?.trim() ?? null;
  const tableFromUrl = normalizeTableNumber(fromUrl);
  const [qrActivationMessage, setQrActivationMessage] = useState<string | null>(
    null
  );

  const handleSessionExpired = useCallback((message: string) => {
    setQrActivationMessage(message);
  }, []);

  useOrderingInactivity(handleSessionExpired);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      if (!isQrOrderEnforcedOnClient()) {
        setQrActivationMessage(null);
        if (tableFromUrl) {
          markOrderingSessionFromQr(tableFromUrl);
          return;
        }
        if (allowsMenuOrderingWithoutTable(pathname) && !hasTableFromQr()) {
          markMenuOrderingSession();
        }
        return;
      }

      const hasQrCredential =
        Boolean(codeFromUrl) || Boolean(tableFromUrl && accessFromUrl);

      if (hasQrCredential) {
        const params = new URLSearchParams();
        if (codeFromUrl) params.set("code", codeFromUrl);
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
          clearOrderingSession();
          return;
        }

        clearOrderingSession();
        return;
      }

      setQrActivationMessage(null);

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
  }, [tableFromUrl, accessFromUrl, codeFromUrl, pathname]);

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
      qrActivationMessage,
      setTableNumber: (value: string) => {
        if (!isQrOrderEnforcedOnClient()) {
          markOrderingSessionFromQr(value);
        }
      },
    }),
    [orderingEnabled, tableFromQr, tableNumber, qrActivationMessage]
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
