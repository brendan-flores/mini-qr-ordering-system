import { adminApiFetch } from "./api";

export type AdminQrSession = {
  access_jti: string;
  table_number: string;
  device_id: string;
  bound_at: string;
  last_active_at: string;
};

export async function listAdminQrSessions() {
  return adminApiFetch<{ data: AdminQrSession[] }>("/api/admin/qr-sessions");
}

export async function terminateAdminQrSession(accessJti: string) {
  return adminApiFetch<{ data: { ok: true; access_jti: string } }>(
    `/api/admin/qr-sessions/${encodeURIComponent(accessJti)}`,
    { method: "DELETE" }
  );
}
