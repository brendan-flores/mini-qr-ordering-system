import type { CartState } from "./cartTypes";

const CART_STORAGE_KEY = "brencravings-cart";
export const CART_UPDATE_EVENT = "brencravings-cart-update";

const EMPTY_CART: CartState = { items: {} };

/** Cached snapshot for useSyncExternalStore (must be stable when storage unchanged). */
let cachedRaw: string | null | undefined = undefined;
let cachedSnapshot: CartState = EMPTY_CART;

export function getEmptyCart(): CartState {
  return EMPTY_CART;
}

function invalidateCartCache() {
  cachedRaw = undefined;
}

export function getCartSnapshot(): CartState {
  if (typeof window === "undefined") return EMPTY_CART;

  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return EMPTY_CART;
  }

  const normalized = raw ?? "";
  if (cachedRaw === normalized) {
    return cachedSnapshot;
  }

  cachedRaw = normalized;

  if (!normalized) {
    cachedSnapshot = EMPTY_CART;
    return cachedSnapshot;
  }

  try {
    const parsed = JSON.parse(normalized) as CartState;
    if (!parsed?.items || typeof parsed.items !== "object") {
      cachedSnapshot = EMPTY_CART;
    } else {
      cachedSnapshot = { items: parsed.items };
    }
  } catch {
    cachedSnapshot = EMPTY_CART;
  }

  return cachedSnapshot;
}

export function loadCartFromStorage(): CartState {
  return getCartSnapshot();
}

export function saveCartToStorage(state: CartState) {
  if (typeof window === "undefined") return;
  try {
    if (Object.keys(state.items).length === 0) {
      window.sessionStorage.removeItem(CART_STORAGE_KEY);
      cachedRaw = "";
      cachedSnapshot = EMPTY_CART;
      return;
    }
    const raw = JSON.stringify(state);
    window.sessionStorage.setItem(CART_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSnapshot = state;
  } catch {
    invalidateCartCache();
  }
}

export function clearCartStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CART_STORAGE_KEY);
  cachedRaw = "";
  cachedSnapshot = EMPTY_CART;
}

export function emitCartUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_UPDATE_EVENT));
}

export function subscribeToCart(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onCartEvent = () => onStoreChange();
  const onStorage = () => {
    invalidateCartCache();
    onStoreChange();
  };
  window.addEventListener(CART_UPDATE_EVENT, onCartEvent);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CART_UPDATE_EVENT, onCartEvent);
    window.removeEventListener("storage", onStorage);
  };
}

export function cartItemCount(state: CartState) {
  return Object.values(state.items).reduce((sum, it) => sum + it.quantity, 0);
}

export function cartLineCount(state: CartState) {
  return Object.keys(state.items).length;
}
