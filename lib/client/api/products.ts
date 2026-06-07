import { apiFetch } from "./api";

export type { Product, ProductCategory, CategoryTab } from "@/types/product";

import type { Product } from "@/types/product";

export async function getProducts() {
  return apiFetch<{ data: Product[] }>("/api/products");
}
