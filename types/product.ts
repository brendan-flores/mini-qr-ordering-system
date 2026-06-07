export const PRODUCT_CATEGORIES = [
  "Starters",
  "Mains",
  "Desserts",
  "Beverages",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type CategoryTab = "All Items" | ProductCategory;

export type Product = {
  id: string | number;
  name: string;
  price: number;
  category: ProductCategory;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
};
