import { MENU_PAGE_PATH } from "./routes";

const TABLE_STORAGE_KEY = "brencravings-table";
const ORDERING_SESSION_KEY = "brencravings-ordering-session";
/** Set only when guest opened menu via table QR (?table=). */
const TABLE_FROM_QR_KEY = "brencravings-table-from-qr";
export const TABLE_UPDATE_EVENT = "brencravings-table-update";
export const ORDERING_UPDATE_EVENT = "brencravings-ordering-update";

export function isLocalhostClient(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1";
}

/** Localhost only — skip QR scan requirement (live server still enforces). */
export function isQrOrderEnforcedOnClient(): boolean {
  return !isLocalhostClient();
}

/** Localhost: dine-in at checkout without a QR scan (manual table input). */
export function allowsDevDineInWithoutQr(): boolean {
  return !isQrOrderEnforcedOnClient();
}

export function isMenuPagePath(pathname: string): boolean {
  return (
    pathname === MENU_PAGE_PATH || pathname.startsWith(`${MENU_PAGE_PATH}/`)
  );
}

/** Menu without ?table= — ordering allowed (takeout); table badge only after QR. */
export function allowsMenuOrderingWithoutTable(pathname: string): boolean {
  return isMenuPagePath(pathname);
}

export const INTEGER_TABLE_ERROR_MESSAGE =
  "Table number must be a whole number (digits only, no letters).";

/** Thrown when a table value is not a positive integer. */
export class IntegerTableNumberError extends Error {
  readonly code = "INVALID_TABLE_NUMBER";

  constructor(message: string) {
    super(message);
    this.name = "IntegerTableNumberError";
  }
}

function integerTableFailure(
  value: string,
  reason: "empty" | "not_integer" | "too_small"
): TableNumberValidation {
  if (reason === "empty") {
    return { ok: false, message: "Enter a table number." };
  }
  if (reason === "not_integer") {
    return { ok: false, message: INTEGER_TABLE_ERROR_MESSAGE };
  }
  return { ok: false, message: "Table number must be at least 1." };
}

export type TableNumberValidation =
  | { ok: true; table: string }
  | { ok: false; message: string };

/** Non-throwing check for forms and UI. */
export function validateIntegerTableNumber(
  value: string
): TableNumberValidation {
  const trimmed = value.trim();
  if (!trimmed) return integerTableFailure(value, "empty");
  if (!/^\d+$/.test(trimmed)) {
    return integerTableFailure(value, "not_integer");
  }
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n < 1) {
    return integerTableFailure(value, "too_small");
  }
  return { ok: true, table: String(n) };
}

/** Throws {@link IntegerTableNumberError} if not a positive integer. */
export function parseIntegerTableNumber(value: string): string {
  const result = validateIntegerTableNumber(value);
  if (!result.ok) {
    throw new IntegerTableNumberError(result.message);
  }
  return result.table;
}

/** URL / session — only positive integer table ids, else null. */
export function normalizeTableNumber(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const result = validateIntegerTableNumber(value);
  return result.ok ? result.table : null;
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
  const normalized = parseIntegerTableNumber(table);
  window.sessionStorage.setItem(TABLE_STORAGE_KEY, normalized);
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

/** Table QR scan — enables dine-in + shows table number. */
export function markOrderingSessionFromQr(table: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeTableNumber(table);
  if (!normalized) return;
  window.sessionStorage.setItem(TABLE_STORAGE_KEY, normalized);
  window.sessionStorage.setItem(ORDERING_SESSION_KEY, "1");
  window.sessionStorage.setItem(TABLE_FROM_QR_KEY, "1");
  window.sessionStorage.setItem(
    "brencravings-ordering-last-activity",
    String(Date.now())
  );
  window.dispatchEvent(new Event(ORDERING_UPDATE_EVENT));
}

/** @deprecated Use markOrderingSessionFromQr */
export function markOrderingSession(table: string) {
  markOrderingSessionFromQr(table);
}

/** Cart/checkout on menu without a table QR (localhost menu-page testing). */
export function markMenuOrderingSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ORDERING_SESSION_KEY, "1");
  window.sessionStorage.removeItem(TABLE_FROM_QR_KEY);
  window.sessionStorage.removeItem(TABLE_STORAGE_KEY);
  window.dispatchEvent(new Event(ORDERING_UPDATE_EVENT));
}

export function clearOrderingSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ORDERING_SESSION_KEY);
  window.sessionStorage.removeItem(TABLE_FROM_QR_KEY);
  window.sessionStorage.removeItem(TABLE_STORAGE_KEY);
  window.sessionStorage.removeItem("brencravings-ordering-last-activity");
  window.dispatchEvent(new Event(ORDERING_UPDATE_EVENT));
  window.dispatchEvent(new Event(TABLE_UPDATE_EVENT));
}

/** True when cart, checkout, and orders are allowed. */
export function hasOrderingSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ORDERING_SESSION_KEY) === "1";
}

/** True only after a valid ?table= QR scan (show badge, dine-in at table). */
export function hasTableFromQr(): boolean {
  if (typeof window === "undefined") return false;
  if (window.sessionStorage.getItem(TABLE_FROM_QR_KEY) !== "1") return false;
  return getStoredTableNumber() !== null;
}

/** Server snapshot: no ordering without ?table= in URL. */
export function tableNumberFromUrl(
  fromUrl: string | null | undefined
): string | null {
  return normalizeTableNumber(fromUrl ?? null);
}

export function getStoredTableNumber(): string | null {
  if (typeof window === "undefined") return null;
  return normalizeTableNumber(window.sessionStorage.getItem(TABLE_STORAGE_KEY));
}

export function resolveTableNumber(
  fromUrl: string | null | undefined
): string {
  const fromParam = normalizeTableNumber(fromUrl ?? null);
  if (fromParam) return fromParam;
  if (!hasTableFromQr()) return "";
  return getStoredTableNumber() ?? "";
}

/** Live server: table comes only from the QR scan session, not the URL bar. */
export function resolveScannedTableNumber(
  fromUrl: string | null | undefined
): string {
  if (isQrOrderEnforcedOnClient()) {
    return getStoredTableNumber() ?? "";
  }
  return resolveTableNumber(fromUrl);
}

export function menuUrlWithTable(
  baseUrl: string,
  tableNumber: string,
  accessToken?: string
): string {
  const table = parseIntegerTableNumber(tableNumber);
  const url = new URL(baseUrl);
  url.pathname = MENU_PAGE_PATH;
  url.search = "";
  url.searchParams.set("table", table);
  if (accessToken?.trim()) {
    url.searchParams.set("access", accessToken.trim());
  }
  return url.toString();
}

/** Short scan code URL — reliable for phone QR cameras. */
export function menuUrlWithScanCode(baseUrl: string, scanCode: string): string {
  const code = scanCode.trim();
  if (!code) {
    throw new Error("Scan code is required.");
  }
  const url = new URL(baseUrl);
  url.pathname = MENU_PAGE_PATH;
  url.search = "";
  url.searchParams.set("code", code);
  return url.toString();
}
