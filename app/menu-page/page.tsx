"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { CartPanel } from "../../components/cart/CartPanel";
import { CategoryTabs, type CategoryTab } from "../../components/menu/CategoryTabs";
import { MobileMenuView } from "../../components/menu/MobileMenuView";
import { ProductCard } from "../../components/menu/ProductCard";
import { DesktopHeader } from "../../components/layout/DesktopHeader";
import { getProducts, type Product } from "../../client/services/products";
import { useTable } from "../../components/table/TableProvider";
import { UI_MOTION } from "@/lib/ui-motion";

export default function MenuPage() {
  const { orderingEnabled, qrActivationMessage } = useTable();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CategoryTab>("All Items");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProducts()
      .then(({ data }) => {
        if (!mounted) return;
        setProducts(data);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        const message = e instanceof Error ? e.message : "Failed to load products";
        setError(message);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products;
    if (tab !== "All Items") {
      list = list.filter((p) => p.category === tab);
    }
    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, tab]);

  return (
    <>
      <Suspense fallback={null}>
        <MobileMenuView
          loading={loading}
          error={error}
          tab={tab}
          onTabChange={setTab}
          search={search}
          onSearchChange={setSearch}
          filtered={filtered}
          orderingEnabled={orderingEnabled}
          qrActivationMessage={qrActivationMessage}
        />
      </Suspense>

      <div
        className={`menu-live ui-live hidden min-h-screen flex-col bg-[var(--color-background)] lg:flex`}
      >
        <DesktopHeader />

        <div
          className={[
            "mx-auto grid h-[calc(100vh-4rem)] w-full max-w-[1280px] gap-6 px-6 pt-20",
            orderingEnabled
              ? "grid-cols-[minmax(0,1fr)_360px]"
              : "grid-cols-1",
          ].join(" ")}
        >
          <main className="menu-scroll flex min-h-0 flex-col overflow-y-auto pb-8">
            {!orderingEnabled ? (
              <div
                className={`${UI_MOTION.fadeIn} mt-2 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)]/40 px-4 py-3 text-sm text-zinc-800`}
                role="status"
              >
                {qrActivationMessage ??
                  "Scan your table QR code to add items and place an order."}
              </div>
            ) : null}

            <div
              className={`${UI_MOTION.fadeIn} sticky top-0 z-10 space-y-4 bg-[var(--color-background)]/95 pb-2 backdrop-blur-sm`}
            >
              <div className={`${UI_MOTION.fadeUp} relative w-full`} style={{ animationDelay: "40ms" }}>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className={`${UI_MOTION.smooth} w-full rounded-xl border border-[var(--color-surface-line)] bg-white py-3 pl-10 pr-4 text-sm text-zinc-800 outline-none focus:border-[var(--color-primary)]`}
                />
              </div>
              <CategoryTabs value={tab} onChange={setTab} />
            </div>

            <div key={`${tab}-${search.trim()}`} className={UI_MOTION.fadeUp}>
            {loading ? (
              <div className={`${UI_MOTION.fadeIn} mt-6 rounded-2xl bg-white p-6 text-sm text-zinc-600`}>
                Loading menu…
              </div>
            ) : error ? (
              <div className={`${UI_MOTION.fadeIn} mt-6 rounded-2xl bg-rose-50 p-6 text-sm text-rose-800`}>
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className={`${UI_MOTION.fadeUp} mt-6 rounded-2xl bg-white p-6 text-sm text-zinc-600`}>
                No items found in {tab}
                {search.trim() ? ` matching "${search.trim()}"` : ""}.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p, index) => (
                  <div
                    key={String(p.id)}
                    className={`${UI_MOTION.scaleIn} h-full min-h-0`}
                    style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
                  >
                    <ProductCard
                      product={p}
                      orderingEnabled={orderingEnabled}
                    />
                  </div>
                ))}
              </div>
            )}
            </div>
          </main>

          {orderingEnabled ? <CartPanel /> : null}
        </div>
      </div>
    </>
  );
}
