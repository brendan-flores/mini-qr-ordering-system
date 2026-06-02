"use client";

import Image from "next/image";
import type { Product } from "../../client/services/products";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../cart/cartUtils";
import { Button } from "../ui/Button";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="relative h-40 w-full bg-zinc-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-zinc-900">
              {product.name}
            </div>
            <div className="mt-1 text-sm font-semibold text-rose-700">
              {formatMoney(product.price)}
            </div>
          </div>
        </div>
        <Button
          type="button"
          className="mt-4 w-full"
          onClick={() => add(product)}
        >
          + Add to Order
        </Button>
      </div>
    </div>
  );
}

