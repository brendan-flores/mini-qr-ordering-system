const TABLE_STORAGE_KEY = "brencravings-table";
export const TABLE_UPDATE_EVENT = "brencravings-table-update";

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
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(TABLE_UPDATE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Server snapshot: URL param only (no sessionStorage). */
export function tableNumberFromUrl(fromUrl: string | null | undefined): string {
  return normalizeTableNumber(fromUrl ?? null) ?? "1";
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
  const url = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.searchParams.set("table", tableNumber);
  return url.toString();
}
