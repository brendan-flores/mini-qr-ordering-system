/** Canonical menu image URLs — matched to product names (Unsplash). */
export const LAVA_CAKE_IMAGE_URL =
  "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80";

const PRODUCT_IMAGE_URLS: Record<string, string> = {
  "Truffle Parmesan Fries":
    "https://images.unsplash.com/photo-1682117650826-881357860ec9?auto=format&fit=crop&w=800&q=80",
  "Signature Wagyu Burger":
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Dark Chocolate Lava Cake": LAVA_CAKE_IMAGE_URL,
  "Iced Matcha Latte":
    "https://images.unsplash.com/photo-1717398804998-ad2d48822518?auto=format&fit=crop&w=800&q=80",
};

export function resolveProductImageUrl(product: {
  name: string;
  image_url?: string | null;
}): string | null {
  const named = PRODUCT_IMAGE_URLS[product.name];
  if (named) return named;
  const url = product.image_url?.trim();
  if (url) return url;
  return null;
}

export function withResolvedProductImages<
  T extends { name: string; image_url?: string | null },
>(products: T[]): T[] {
  return products.map((p) => ({
    ...p,
    image_url: resolveProductImageUrl(p),
  }));
}
