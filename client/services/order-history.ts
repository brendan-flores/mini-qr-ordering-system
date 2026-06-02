const ORDER_IDS_KEY = "brencravings-order-ids";
const MAX_IDS = 50;

export function getStoredOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDER_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

export function rememberOrderId(id: string | number) {
  if (typeof window === "undefined") return;
  const key = String(id);
  const ids = getStoredOrderIds().filter((x) => x !== key);
  ids.unshift(key);
  setStoredOrderIds(ids);
}

export function setStoredOrderIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const unique = [...new Set(ids.map(String).filter(Boolean))];
  window.localStorage.setItem(
    ORDER_IDS_KEY,
    JSON.stringify(unique.slice(0, MAX_IDS))
  );
}

export function forgetOrderId(id: string | number) {
  const key = String(id);
  setStoredOrderIds(getStoredOrderIds().filter((x) => x !== key));
}
