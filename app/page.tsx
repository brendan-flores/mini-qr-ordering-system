"use client";

import { useEffect, useMemo, useState } from "react";
import { CartProvider } from "../components/cart/CartContext";
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
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    // Schema doesn’t have categories; keep tabs as UI affordance.
    if (tab !== "All Items") return list;
    return list;
  }, [products, search, tab]);

  async function openQr() {
    const url =
      typeof window === "undefined" ? "" : `${window.location.origin}/`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 220 });
    setQrDataUrl(dataUrl);
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-black/5 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="text-xl font-extrabold text-rose-700">
                Gourmet QR
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={openQr}>
                Show QR
              </Button>
              <a
                href="/admin"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5"
              >
                Admin
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
          <main>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative w-full">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-rose-700"
                />
              </div>
            </div>

            <CategoryTabs value={tab} onChange={setTab} />

            {loading ? (
              <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-zinc-600">
                Loading menu…
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl bg-rose-50 p-6 text-sm text-rose-800">
                {error}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={String(p.id)} product={p} />
                ))}
              </div>
            )}
          </main>

          <CartPanel />
        </div>

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
