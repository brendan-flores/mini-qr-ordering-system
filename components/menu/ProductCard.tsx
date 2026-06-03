"use client";

import Image from "next/image";
import type { Product } from "../../client/services/products";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../cart/cartUtils";
import { getProductDescription } from "@/lib/product-descriptions";
import { resolveProductImageUrl } from "@/lib/product-images";
import { UI_MOTION } from "@/lib/ui-motion";
import { Button } from "../ui/Button";

export function ProductCard({
  product,
  orderingEnabled = true,
}: {
  product: Product;
  orderingEnabled?: boolean;
}) {
  const { add } = useCart();
  const imageUrl = resolveProductImageUrl(product);

  return (
    <article
      className={`${UI_MOTION.smooth} group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-surface-line)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] motion-reduce:hover:translate-y-0`}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className={`${UI_MOTION.smooth} object-cover duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-subtle)] text-sm text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug text-zinc-900 sm:text-xl sm:leading-7">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-primary)]">
          {formatMoney(product.price)}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-[var(--color-text-muted)]">
          {getProductDescription(product)}
        </p>
        {orderingEnabled ? (
          <div className="mt-auto pt-3">
            <Button
              type="button"
              className="h-10 w-full gap-1.5 px-3 py-0 text-sm leading-none"
              onClick={() => add(product)}
            >
              <span className="inline-flex items-center text-base leading-none">
                +
              </span>
              <span className="leading-none">Add to Order</span>
            </Button>
          </div>
        ) : (
          <span className="mt-auto block pt-3" aria-hidden />
        )}
      </div>
    </article>
  );
}
