import type { Product } from "../../client/services/products";

export type CartItem = {
  product: Product;
  quantity: number;
  note?: string;
};

export type CartState = {
  items: Record<string, CartItem>;
};

