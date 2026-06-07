import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
  note?: string;
};

export type CartState = {
  items: Record<string, CartItem>;
};

