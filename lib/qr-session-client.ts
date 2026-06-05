import { getOrCreateDeviceId } from "@/lib/device-session";

export type QrSessionClientStatus = "active" | "inactive" | "terminated";

export type QrSessionSnapshot = {
  status: QrSessionClientStatus;
  table?: string;
};

/** Session check for sync and real-time admin-termination polling. */
export async function fetchQrSessionSnapshot(): Promise<QrSessionSnapshot> {
  const params = new URLSearchParams();
  const deviceId = getOrCreateDeviceId();
  if (deviceId) params.set("device_id", deviceId);

  const res = await fetch(
    `/api/qr/session${params.size ? `?${params}` : ""}`,
    { credentials: "include", cache: "no-store" }
  );
  if (!res.ok) return { status: "inactive" };

  const data = (await res.json()) as {
    active?: boolean;
    table?: string;
    terminated?: boolean;
  };

  if (data.terminated) return { status: "terminated" };
  if (!data.active || !data.table) return { status: "inactive" };
  return { status: "active", table: data.table };
}
