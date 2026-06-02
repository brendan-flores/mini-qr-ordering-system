"use client";

import Image from "next/image";
import type { Product } from "../../client/services/products";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../cart/cartUtils";
import { Button } from "../ui/Button";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xl font-semibold leading-7 text-zinc-900">
              {product.name}
            </h3>
          </div>
          <div className="text-lg font-semibold text-[var(--color-primary)]">
            {formatMoney(product.price)}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-[var(--color-text-muted)]">
          Freshly prepared and served hot from our kitchen.
        </p>
        <Button
          type="button"
          className="mt-4 w-full gap-1 py-2 text-sm"
          onClick={() => add(product)}
        >
          <span className="text-base">+</span> Add to Order
        </Button>
      </div>
    </article>
  );
}

