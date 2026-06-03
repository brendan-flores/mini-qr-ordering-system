/** Shared product image URLs (menu seed + Supabase updates) */
export const LAVA_CAKE_IMAGE_URL =
  "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80";

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  "Dark Chocolate Lava Cake": LAVA_CAKE_IMAGE_URL,
};

export function resolveProductImageUrl(product: {
  name: string;
  image_url?: string | null;
}): string | null {
  const url = product.image_url?.trim();
  if (url) return url;
  return PRODUCT_IMAGE_FALLBACKS[product.name] ?? null;
}

export function withResolvedProductImages<
  T extends { name: string; image_url?: string | null },
>(products: T[]): T[] {
  return products.map((p) => ({
    ...p,
    image_url: resolveProductImageUrl(p),
  }));
}
