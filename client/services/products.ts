import { apiFetch } from "./api";

export type Product = {
  id: string | number;
  name: string;
  price: number;
  image_url?: string | null;
  created_at: string;
};

export async function getProducts() {
  return apiFetch<{ data: Product[] }>("/api/products");
}

