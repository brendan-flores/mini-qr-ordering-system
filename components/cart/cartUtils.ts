import type { CartItem } from "./cartTypes";

export function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
}

