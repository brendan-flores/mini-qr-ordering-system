"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "../../client/services/products";
import type { CategoryTab, ProductCategory } from "./CategoryTabs";
import { MobileCategoryTabs } from "./MobileCategoryTabs";
import { useCart } from "../cart/CartContext";
import { MobileCartSheet } from "../cart/MobileCartSheet";
import { MobileOrdersPanel } from "./MobileOrdersPanel";
import { formatMoney } from "../cart/cartUtils";
import { MaterialIcon } from "../ui/MaterialIcon";
import { BrandLogo } from "../brand/BrandLogo";
import { TableBadge } from "../table/TableBadge";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { useActiveOrderCount } from "../orders/useActiveOrderCount";
import { getProductDescription } from "@/lib/product-descriptions";
import { resolveProductImageUrl } from "@/lib/product-images";
import { UI_MOTION, uiStaggerMs } from "@/lib/ui-motion";

const POPULAR_NAME = "Dark Chocolate Lava Cake";

const categoryOrder: ProductCategory[] = [
  "Starters",
  "Mains",
  "Desserts",
  "Beverages",
];

function tabLabel(tab: CategoryTab) {
  if (tab === "All Items") return "All";
  if (tab === "Beverages") return "Drinks";
  return tab;
}

function MobileProductCard({
  product,
  badge,
  orderingEnabled,
}: {
  product: Product;
  badge?: string;
  orderingEnabled: boolean;
}) {
  const { add } = useCart();
  const imageUrl = resolveProductImageUrl(product);

  return (
    <article
      className={`${UI_MOTION.smooth} flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-surface-line)]/30 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0`}
    >
      <div className="relative aspect-square shrink-0 overflow-hidden bg-[var(--color-surface-subtle)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
            No image
          </div>
        )}
        {badge ? (
          <span className="absolute left-2 top-2 rounded-sm bg-[#006c49] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-tight text-zinc-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-[11px] leading-snug text-[var(--color-text-muted)]">
          {getProductDescription(product)}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-surface-line)]/20 pt-2">
          <span className="text-base font-semibold text-[var(--color-primary)]">
            {formatMoney(product.price)}
          </span>
          {orderingEnabled ? (
            <button
              type="button"
              onClick={() => add(product)}
              className={`${UI_MOTION.smooth} flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] active:scale-90 hover:bg-[var(--color-primary)]/10 motion-reduce:active:scale-100`}
              aria-label={`Add ${product.name}`}
            >
              <MaterialIcon name="add" className="text-[20px]" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MobileMenuView({
  loading,
  error,
  tab,
  onTabChange,
  search,
  onSearchChange,
  filtered,
  orderingEnabled,
  qrActivationMessage = null,
}: {
  loading: boolean;
  error: string | null;
  tab: CategoryTab;
  onTabChange(next: CategoryTab): void;
  search: string;
  onSearchChange(value: string): void;
  filtered: Product[];
  orderingEnabled: boolean;
  qrActivationMessage?: string | null;
}) {
  const searchParams = useSearchParams();
  const { pieceCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [navTab, setNavTab] = useState<"menu" | "orders">("menu");

  useEffect(() => {
    if (orderingEnabled && searchParams.get("tab") === "orders") {
      setNavTab("orders");
    }
  }, [searchParams, orderingEnabled]);

  useEffect(() => {
    if (!orderingEnabled) {
      setNavTab("menu");
      setCartOpen(false);
    }
  }, [orderingEnabled]);

  const cartCount = pieceCount;
  const activeOrderCount = useActiveOrderCount(orderingEnabled);

  const sections = useMemo(() => {
    if (tab !== "All Items" || search.trim()) {
      return [{ title: tabLabel(tab), products: filtered }];
    }
    return categoryOrder
      .map((category) => ({
        title: category === "Beverages" ? "Drinks" : category,
        products: filtered.filter((p) => p.category === category),
      }))
      .filter((section) => section.products.length > 0);
  }, [filtered, tab, search]);

  function closeCart() {
    setCartOpen(false);
  }

  function toggleCart() {
    setCartOpen((open) => !open);
  }

  function openOrders() {
    setNavTab("orders");
    setCartOpen(false);
  }

  function openMenu() {
    setNavTab("menu");
    setCartOpen(false);
  }

  const mainPadding = orderingEnabled ? "pb-28" : "pb-6";

  return (
    <div className="menu-live ui-live flex h-dvh min-h-0 flex-col overflow-hidden pt-16 lg:hidden">
      <header
        className={[
          `${UI_MOTION.fadeIn} fixed top-0 z-50 flex h-16 w-full items-center justify-center bg-[var(--background)] px-4 shadow-sm`,
          `${UI_MOTION.smooth} transition-[filter]`,
          cartOpen ? "pointer-events-none brightness-[0.92]" : "",
        ].join(" ")}
      >
        <BrandLogo
          href={MENU_PAGE_PATH}
          textClassName="text-xl font-bold leading-none text-[var(--color-primary)]"
        />
      </header>

      {navTab === "menu" ? (
        <div
          className={[
            `${UI_MOTION.fadeUp} shrink-0 border-b border-[var(--color-surface-line)] bg-[var(--background)] px-4 pb-3 pt-2`,
            `${UI_MOTION.smooth} transition-[filter]`,
            cartOpen ? "pointer-events-none brightness-[0.92]" : "",
          ].join(" ")}
        >
          <div className={`${UI_MOTION.fadeIn} relative`} style={{ animationDelay: "50ms" }}>
            <MaterialIcon
              name="search"
              filled={false}
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-base text-[var(--color-text-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search menu..."
              className={`${UI_MOTION.smooth} h-12 w-full rounded-xl border border-[var(--color-surface-line)] bg-white py-0 pl-11 pr-4 text-base text-zinc-900 shadow-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`}
            />
          </div>
          {orderingEnabled ? (
            <div
              className={`${UI_MOTION.fadeUp} mt-3 flex justify-center`}
              style={{ animationDelay: "90ms" }}
            >
              <TableBadge />
            </div>
          ) : (
            <p
              className={`${UI_MOTION.fadeIn} mt-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)]/40 px-3 py-2.5 text-center text-xs text-zinc-800`}
              role="status"
            >
              {qrActivationMessage ??
                "Scan your table QR code to add items and place an order."}
            </p>
          )}
          <MobileCategoryTabs value={tab} onChange={onTabChange} />
        </div>
      ) : null}

      <main
        className={[
          "menu-scroll mx-auto min-h-0 w-full max-w-[1280px] flex-1 overflow-y-auto px-4 pt-4",
          `${UI_MOTION.smooth} transition-[filter,transform] duration-300`,
          mainPadding,
          cartOpen ? "pointer-events-none scale-[0.98] brightness-[0.92]" : "",
        ].join(" ")}
      >
        <div key={`${navTab}-${tab}-${search.trim()}`} className={UI_MOTION.fadeUp}>
          {orderingEnabled && navTab === "orders" ? (
            <MobileOrdersPanel />
          ) : loading ? (
            <p className={`${UI_MOTION.fadeIn} mt-6 text-sm text-zinc-600`}>
              Loading menu…
            </p>
          ) : error ? (
            <p className={`${UI_MOTION.fadeIn} mt-6 text-sm text-rose-800`}>{error}</p>
          ) : filtered.length === 0 ? (
            <p className={`${UI_MOTION.fadeUp} mt-6 text-sm text-zinc-600`}>
              No items found in {tabLabel(tab)}
              {search.trim() ? ` matching "${search.trim()}"` : ""}.
            </p>
          ) : (
            <div className="space-y-8">
              {sections.map((section, sectionIndex) => (
                <section
                  key={section.title}
                  className={UI_MOTION.fadeUp}
                  style={{ animationDelay: uiStaggerMs(sectionIndex, 70) }}
                >
                  <h2 className="mb-3 px-0.5 text-lg font-semibold text-zinc-900">
                    {section.title}
                  </h2>
                  <div className="mobile-menu-grid">
                    {section.products.map((product, productIndex) => (
                      <div
                        key={String(product.id)}
                        className={`${UI_MOTION.scaleIn} h-full min-h-0`}
                        style={{
                          animationDelay: uiStaggerMs(
                            sectionIndex * 2 + productIndex,
                            35
                          ),
                        }}
                      >
                        <MobileProductCard
                          product={product}
                          orderingEnabled={orderingEnabled}
                          badge={
                            product.name === POPULAR_NAME ? "Popular" : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {orderingEnabled && navTab === "menu" && cartCount > 0 && !cartOpen ? (
        <div className={`${UI_MOTION.scaleIn} fixed bottom-24 right-4 z-40 lg:hidden`}>
          <button
            type="button"
            onClick={toggleCart}
            className={`${UI_MOTION.smooth} relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgba(184,0,53,0.3)] hover:scale-105 active:scale-90 motion-reduce:hover:scale-100`}
            aria-label="Open cart"
          >
            <MaterialIcon name="shopping_basket" />
            <span
              key={cartCount}
              className={`${UI_MOTION.countPop} absolute -right-0.5 -top-0.5 flex h-6 w-6 translate-x-1/4 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white text-[10px] font-bold text-[var(--color-primary)]`}
            >
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </button>
        </div>
      ) : null}

      {orderingEnabled ? (
        <nav
          className={`${UI_MOTION.fadeUp} fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-[#e5bdbe] bg-[var(--background)] px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden`}
          style={{ animationDelay: "120ms" }}
        >
          <button
            type="button"
            onClick={openMenu}
            className={[
              `${UI_MOTION.smooth} flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 active:scale-90 motion-reduce:active:scale-100`,
              navTab === "menu"
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
            ].join(" ")}
          >
            <MaterialIcon name="menu_book" className="mb-1" />
            <span className="text-xs font-semibold">Menu</span>
          </button>
          <button
            type="button"
            onClick={toggleCart}
            className={[
              `${UI_MOTION.smooth} relative flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 active:scale-90 motion-reduce:active:scale-100`,
              cartOpen
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
            ].join(" ")}
          >
            <MaterialIcon name="shopping_cart" filled={false} className="mb-1" />
            <span className="text-xs font-semibold">Cart</span>
            {cartCount > 0 ? (
              <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            ) : null}
          </button>
          <button
            type="button"
            onClick={openOrders}
            className={[
              `${UI_MOTION.smooth} relative flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 active:scale-90 motion-reduce:active:scale-100`,
              navTab === "orders"
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
            ].join(" ")}
          >
            <MaterialIcon name="receipt_long" filled={false} className="mb-1" />
            <span className="text-xs font-semibold">Orders</span>
            {activeOrderCount > 0 ? (
              <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold text-white">
                {activeOrderCount > 9 ? "9+" : activeOrderCount}
              </span>
            ) : null}
          </button>
        </nav>
      ) : null}

      {orderingEnabled ? (
        <MobileCartSheet open={cartOpen} onClose={closeCart} />
      ) : null}
    </div>
  );
}
