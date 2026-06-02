export function checkoutUrl(orderId: string | number, returnTo: string) {
  const params = new URLSearchParams({
    orderId: String(orderId),
    return: returnTo,
  });
  return `/checkout?${params.toString()}`;
}
