export const ORDER_UPDATED_EVENT = "order-updated";

const ORDER_SYNC_STORAGE_KEY = "brencravings-order-sync";

export function notifyOrderUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
  try {
    localStorage.setItem(ORDER_SYNC_STORAGE_KEY, String(Date.now()));
  } catch {
    /* storage unavailable */
  }
}

/** Same-tab event + cross-tab localStorage ping (e.g. admin + customer tabs). */
export function subscribeToOrderUpdates(onUpdate: () => void) {
  if (typeof window === "undefined") return () => {};

  function handleUpdate() {
    onUpdate();
  }

  function onStorage(e: StorageEvent) {
    if (e.key === ORDER_SYNC_STORAGE_KEY) handleUpdate();
  }

  window.addEventListener(ORDER_UPDATED_EVENT, handleUpdate);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(ORDER_UPDATED_EVENT, handleUpdate);
    window.removeEventListener("storage", onStorage);
  };
}
