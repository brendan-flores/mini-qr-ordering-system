/**
 * Order ids for "Your Orders" — stored in sessionStorage so each browser
 * session on a device keeps its own list. Combined with client_device_id on
 * the server, another phone scanning the same table QR cannot see these orders.
 */
const ORDER_IDS_KEY = "brencravings-order-ids";
const MAX_IDS = 50;

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(ORDER_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

export function getStoredOrderIds(): string[] {
  return readIds();
}

export function rememberOrderId(id: string | number) {
  if (typeof window === "undefined") return;
  const key = String(id);
  const ids = readIds().filter((x) => x !== key);
  ids.unshift(key);
  setStoredOrderIds(ids);
}

export function setStoredOrderIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map(String).filter(Boolean))];
  window.sessionStorage.setItem(
    ORDER_IDS_KEY,
    JSON.stringify(unique.slice(0, MAX_IDS))
  );
}

export function forgetOrderId(id: string | number) {
  const key = String(id);
  setStoredOrderIds(readIds().filter((x) => x !== key));
}
