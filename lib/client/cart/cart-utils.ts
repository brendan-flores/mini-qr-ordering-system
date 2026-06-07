import type { CartItem } from "@/lib/client/cart/cart-types";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return pesoFormatter.format(amount);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
}

export function cartTotal(subtotal: number) {
  return Number(subtotal.toFixed(2));
}
