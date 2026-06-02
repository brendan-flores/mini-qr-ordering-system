export const ORDER_UPDATED_EVENT = "order-updated";

export function notifyOrderUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}
