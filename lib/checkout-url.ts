export function checkoutUrl(orderId: string | number, returnTo: string) {
  const params = new URLSearchParams({
    orderId: String(orderId),
    return: returnTo,
  });
  return `/checkout?${params.toString()}`;
}

export function cartCheckoutUrl(returnTo: string) {
  const params = new URLSearchParams({ return: returnTo });
  return `/checkout?${params.toString()}`;
}

export function confirmationUrl(orderId: string | number, returnTo: string) {
  const params = new URLSearchParams({
    orderId: String(orderId),
    return: returnTo,
  });
  return `/checkout/confirmation?${params.toString()}`;
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
