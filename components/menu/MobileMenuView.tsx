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

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--color-surface-line)]/30 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-subtle)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="50vw"
          />
        ) : null}
        {badge ? (
          <span className="absolute left-2 top-2 rounded-sm bg-[#006c49] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-grow flex-col p-3">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold leading-tight text-zinc-900">
          {product.name}
        </h3>
        <p className="mb-2 line-clamp-2 flex-grow text-[11px] leading-snug text-[var(--color-text-muted)]">
          Freshly prepared and served hot.
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-surface-line)]/20 pt-2">
          <span className="text-base font-semibold text-[var(--color-primary)]">
            {formatMoney(product.price)}
          </span>
          {orderingEnabled ? (
            <button
              type="button"
              onClick={() => add(product)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] transition-transform active:scale-90 hover:bg-[var(--color-primary)]/10"
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
}: {
  loading: boolean;
  error: string | null;
  tab: CategoryTab;
  onTabChange(next: CategoryTab): void;
  search: string;
  onSearchChange(value: string): void;
  filtered: Product[];
  orderingEnabled: boolean;
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
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden pt-16 lg:hidden">
      <header
        className={[
          "fixed top-0 z-50 flex h-16 w-full items-center justify-center bg-[var(--background)] px-4 shadow-sm transition-[filter] duration-300",
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
            "shrink-0 border-b border-[var(--color-surface-line)] bg-[var(--background)] px-4 pb-3 pt-2 transition-[filter] duration-300",
            cartOpen ? "pointer-events-none brightness-[0.92]" : "",
          ].join(" ")}
        >
          <div className="relative">
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
              className="h-12 w-full rounded-xl border border-[var(--color-surface-line)] bg-white py-0 pl-11 pr-4 text-base text-zinc-900 shadow-sm outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          {orderingEnabled ? (
            <div className="mt-3 flex justify-center">
              <TableBadge />
            </div>
          ) : null}
          <MobileCategoryTabs value={tab} onChange={onTabChange} />
        </div>
      ) : null}

      <main
        className={[
          "menu-scroll mx-auto min-h-0 w-full max-w-[1280px] flex-1 overflow-y-auto px-4 pt-4 transition-[filter] duration-300",
          mainPadding,
          cartOpen ? "pointer-events-none scale-[0.98] brightness-[0.92]" : "",
        ].join(" ")}
      >
        {orderingEnabled && navTab === "orders" ? (
          <MobileOrdersPanel />
        ) : loading ? (
          <p className="mt-6 text-sm text-zinc-600">Loading menu…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-rose-800">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">
            No items found in {tabLabel(tab)}
            {search.trim() ? ` matching "${search.trim()}"` : ""}.
          </p>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 px-0.5 text-lg font-semibold text-zinc-900">
                  {section.title}
                </h2>
                <div className="mobile-menu-grid">
                  {section.products.map((product) => (
                    <MobileProductCard
                      key={String(product.id)}
                      product={product}
                      orderingEnabled={orderingEnabled}
                      badge={
                        product.name === POPULAR_NAME ? "Popular" : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {orderingEnabled && navTab === "menu" && cartCount > 0 && !cartOpen ? (
        <div className="fixed bottom-24 right-4 z-40 lg:hidden">
          <button
            type="button"
            onClick={toggleCart}
            className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_12px_24px_rgba(184,0,53,0.3)] transition-transform active:scale-90 hover:opacity-90"
            aria-label="Open cart"
          >
            <MaterialIcon name="shopping_basket" />
            <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 translate-x-1/4 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-white text-[10px] font-bold text-[var(--color-primary)]">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          </button>
        </div>
      ) : null}

      {orderingEnabled ? (
        <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-[#e5bdbe] bg-[var(--background)] px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] lg:hidden">
          <button
            type="button"
            onClick={openMenu}
            className={[
              "flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 transition-transform active:scale-90",
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
              "relative flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 transition-transform active:scale-90",
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
              "relative flex cursor-pointer flex-col items-center justify-center rounded-full px-4 py-1 transition-transform active:scale-90",
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
