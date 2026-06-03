import { apiFetch } from "./api";
import type { ProductCategory } from "../../components/menu/CategoryTabs";

export type Product = {
  id: string | number;
  name: string;
  price: number;
  category: ProductCategory;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
};

export async function getProducts() {
  return apiFetch<{ data: Product[] }>("/api/products");
}

