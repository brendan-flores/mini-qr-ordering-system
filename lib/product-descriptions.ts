/** Short menu blurbs keyed by product name (seed + Supabase). */
export const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "Truffle Parmesan Fries":
    "Crispy fries with truffle oil and grated parmesan.",
  "Garlic Herb Bruschetta":
    "Toasted bread with garlic, herbs, and ripe tomatoes.",
  "Signature Wagyu Burger":
    "Rich wagyu beef patty on a soft bun with classic fixings.",
  "Roasted Roots Quinoa Bowl":
    "Roasted vegetables and quinoa with a light vinaigrette.",
  "Dark Chocolate Lava Cake":
    "Warm chocolate cake with a gooey molten center.",
  "Iced Matcha Latte": "Chilled matcha and milk served over ice.",
  "Sparkling Citrus Cooler":
    "Sparkling water brightened with fresh citrus.",
};

const DEFAULT_DESCRIPTION = "Made fresh when you order.";

export function getProductDescription(product: {
  name: string;
  description?: string | null;
}): string {
  const fromDb = product.description?.trim();
  if (fromDb) return fromDb;
  return PRODUCT_DESCRIPTIONS[product.name] ?? DEFAULT_DESCRIPTION;
}

export function withResolvedProductDescriptions<
  T extends { name: string; description?: string | null },
>(products: T[]): (T & { description: string })[] {
  return products.map((p) => ({
    ...p,
    description: getProductDescription(p),
  }));
}
