const ADMIN_QR_TABLE_KEY = "brencravings-admin-qr-table";

export function getAdminQrTableNumber(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(ADMIN_QR_TABLE_KEY)?.trim() ?? "";
}

export function setAdminQrTableNumber(table: string) {
  if (typeof window === "undefined") return;
  const trimmed = table.trim();
  if (!trimmed) {
    window.sessionStorage.removeItem(ADMIN_QR_TABLE_KEY);
    return;
  }
  window.sessionStorage.setItem(ADMIN_QR_TABLE_KEY, trimmed);
}
