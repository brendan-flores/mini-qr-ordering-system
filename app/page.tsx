"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { CartPanel } from "../components/cart/CartPanel";
import { CategoryTabs, type CategoryTab } from "../components/menu/CategoryTabs";
import { MobileMenuView } from "../components/menu/MobileMenuView";
import { ProductCard } from "../components/menu/ProductCard";
import { QrModal } from "../components/qr/QrModal";
import { DesktopHeader } from "../components/layout/DesktopHeader";
import { getProducts, type Product } from "../client/services/products";
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CategoryTab>("All Items");
  const [search, setSearch] = useState("");
  const [qrOpen, setQrOpen] = useState(false);

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

  function openQr() {
    setQrOpen(true);
  }

  function downloadQr(dataUrl: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "brencravings-table-qr.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

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
          onOpenQr={openQr}
        />
      </Suspense>

      <div className="hidden min-h-screen flex-col bg-[var(--color-background)] lg:flex">
        <DesktopHeader onShowQr={openQr} />

        <div className="mx-auto grid h-[calc(100vh-4rem)] w-full max-w-[1280px] grid-cols-[minmax(0,1fr)_360px] gap-6 px-6 pt-20">
          <main className="menu-scroll flex min-h-0 flex-col overflow-y-auto pb-8">
            <div className="sticky top-0 z-10 space-y-4 bg-[var(--color-background)]/95 pb-2 backdrop-blur-sm">
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full rounded-xl border border-[var(--color-surface-line)] bg-white py-3 pl-10 pr-4 text-sm text-zinc-800 outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>
              <CategoryTabs value={tab} onChange={setTab} />
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-zinc-600">
                Loading menu…
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl bg-rose-50 p-6 text-sm text-rose-800">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-zinc-600">
                No items found in {tab}
                {search.trim() ? ` matching "${search.trim()}"` : ""}.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={String(p.id)} product={p} />
                ))}
              </div>
            )}
          </main>

          <CartPanel />
        </div>
      </div>

      {qrOpen ? (
        <QrModal
          onClose={() => setQrOpen(false)}
          onDownload={downloadQr}
        />
      ) : null}
    </>
  );
}
