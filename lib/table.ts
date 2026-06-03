import { MENU_PAGE_PATH } from "./routes";

const TABLE_STORAGE_KEY = "brencravings-table";
const ORDERING_SESSION_KEY = "brencravings-ordering-session";
export const TABLE_UPDATE_EVENT = "brencravings-table-update";
export const ORDERING_UPDATE_EVENT = "brencravings-ordering-update";

export function normalizeTableNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[a-zA-Z0-9_-]{1,12}$/.test(trimmed)) return null;
  return trimmed;
}

export function getTableFromSearchParam(
  search: string | URLSearchParams
): string | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  return normalizeTableNumber(params.get("table"));
}

export function persistTableNumber(table: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TABLE_STORAGE_KEY, table);
  window.dispatchEvent(new Event(TABLE_UPDATE_EVENT));
}

export function subscribeToTable(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener(TABLE_UPDATE_EVENT, handler);
  window.addEventListener(ORDERING_UPDATE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(TABLE_UPDATE_EVENT, handler);
    window.removeEventListener(ORDERING_UPDATE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function subscribeToOrdering(onStoreChange: () => void) {
  return subscribeToTable(onStoreChange);
}

export function markOrderingSession(table: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeTableNumber(table);
  if (!normalized) return;
  persistTableNumber(normalized);
  window.sessionStorage.setItem(ORDERING_SESSION_KEY, "1");
  window.dispatchEvent(new Event(ORDERING_UPDATE_EVENT));
}

export function clearOrderingSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ORDERING_SESSION_KEY);
  window.sessionStorage.removeItem(TABLE_STORAGE_KEY);
  window.dispatchEvent(new Event(ORDERING_UPDATE_EVENT));
  window.dispatchEvent(new Event(TABLE_UPDATE_EVENT));
}

/** True after guest scans a table QR (?table= in URL). */
export function hasOrderingSession(): boolean {
  if (typeof window === "undefined") return false;
  if (window.sessionStorage.getItem(ORDERING_SESSION_KEY) !== "1") return false;
  return getStoredTableNumber() !== null;
}

/** Server snapshot: no ordering without ?table= in URL. */
export function tableNumberFromUrl(fromUrl: string | null | undefined): string | null {
  return normalizeTableNumber(fromUrl ?? null);
}

export function getStoredTableNumber(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeTableNumber(window.sessionStorage.getItem(TABLE_STORAGE_KEY));
}

export function resolveTableNumber(
  fromUrl: string | null | undefined
): string {
  return (
    normalizeTableNumber(fromUrl ?? null) ??
    getStoredTableNumber() ??
    "1"
  );
}

export function menuUrlWithTable(
  baseUrl: string,
  tableNumber: string
): string {
  const url = new URL(baseUrl);
  url.pathname = MENU_PAGE_PATH;
  url.search = "";
  url.searchParams.set("table", tableNumber);
  return url.toString();
}
