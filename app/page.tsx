"use client";

import { useEffect, useMemo, useState } from "react";
import { CartProvider, useCart } from "../components/cart/CartContext";
import { CartPanel } from "../components/cart/CartPanel";
import { CategoryTabs, type CategoryTab } from "../components/menu/CategoryTabs";
import { ProductCard } from "../components/menu/ProductCard";
import { Button } from "../components/ui/Button";
import { getProducts, type Product } from "../client/services/products";
import QRCode from "qrcode";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CategoryTab>("All Items");
  const [search, setSearch] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProducts()
      .then(({ data }) => {
        if (!mounted) return;
        setProducts(data);
        setError(null);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load products");
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

  async function openQr() {
    const url =
      process.env.NEXT_PUBLIC_APP_URL ?? `${window.location.origin}/`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 220 });
    setQrDataUrl(dataUrl);
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[var(--color-background)] pb-16 md:pb-0">
        <header className="fixed top-0 z-40 h-16 w-full border-b border-[var(--color-surface-line)] bg-white">
          <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-4 px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[var(--color-primary)]">✕</span>
              <div className="text-3xl font-extrabold text-[var(--color-primary)]">
                BrenFood's
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={openQr}>
                Show QR
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid h-[calc(100vh-4rem)] w-full max-w-[1280px] grid-cols-1 gap-6 px-4 pt-20 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
          <main className="flex min-h-0 flex-col overflow-y-auto pb-8">
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

        <nav className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-[var(--color-surface-line)] bg-white px-4 py-2 md:hidden">
          <div className="flex flex-col items-center rounded-full bg-[var(--color-primary-soft)] px-4 py-1 text-[var(--color-primary)]">
            <span>🍽️</span>
            <span className="text-xs font-semibold">Menu</span>
          </div>
          <MobileCartTab />
          <div className="flex flex-col items-center px-4 py-1 text-zinc-600">
            <span>🧾</span>
            <span className="text-xs font-semibold">Orders</span>
          </div>
        </nav>

        {qrDataUrl ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-zinc-900">
                    Menu QR Code
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Scan to open the ordering page
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-2"
                  onClick={() => setQrDataUrl(null)}
                  aria-label="Close"
                >
                  ✕
                </Button>
              </div>
              <div className="mt-4 flex justify-center rounded-xl bg-zinc-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR code" className="h-[220px] w-[220px]" />
              </div>
              <Button
                type="button"
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => setQrDataUrl(null)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </CartProvider>
  );
}

function MobileCartTab() {
  const { items } = useCart();

  return (
    <div className="relative flex flex-col items-center px-4 py-1 text-zinc-600">
      <span>🛒</span>
      {items.length > 0 ? (
        <span className="absolute right-2 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
          {items.length > 9 ? "9+" : items.length}
        </span>
      ) : null}
      <span className="text-xs font-semibold">Cart</span>
    </div>
  );
}
