export function checkoutUrl(orderId: string | number, returnTo: string) {
  const params = new URLSearchParams({
    orderId: String(orderId),
    return: returnTo,
  });
  return `/checkout?${params.toString()}`;
}

export function cartCheckoutUrl(
  returnTo: string,
  tableNumber?: string | null
) {
  const params = new URLSearchParams({ return: returnTo });
  const table = tableNumber?.trim();
  if (table && /^\d+$/.test(table)) {
    params.set("table", table);
  }
  return `/checkout?${params.toString()}`;
}

/** Primary post-checkout destination: live order tracking. */
export function orderTrackUrl(
  orderId: string | number,
  options?: { placed?: boolean; returnTo?: string }
) {
  const params = new URLSearchParams();
  if (options?.placed) params.set("placed", "1");
  if (options?.returnTo?.startsWith("/")) {
    params.set("return", options.returnTo);
  }
  const q = params.toString();
  return `/orders/${encodeURIComponent(String(orderId))}${q ? `?${q}` : ""}`;
}

/** Pending GCash payment or failed retry — checkout, not tracking. */
export function orderNeedsCheckout(order: {
  payment_method: string;
  payment_status: string;
}) {
  if (order.payment_method === "gcash") {
    return (
      order.payment_status === "Pending" || order.payment_status === "Failed"
    );
  }
  return false;
}

/** Whether the customer should see the confirmation screen */
export function isOrderConfirmed(order: {
  payment_method: string;
  payment_status: string;
}) {
  if (order.payment_status === "Paid") return true;
  if (order.payment_method === "cod" && order.payment_status === "Pending") {
    return true;
  }
  return false;
}
