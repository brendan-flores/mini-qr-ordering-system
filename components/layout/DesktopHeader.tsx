"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "../brand/BrandLogo";
import { Button } from "../ui/Button";

const navItems = [
  { href: "/", label: "Menu" },
  { href: "/orders", label: "Orders" },
] as const;

export function DesktopHeader({ onShowQr }: { onShowQr?(): void }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-40 hidden h-16 w-full border-b border-[var(--color-surface-line)] bg-white lg:block">
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-4 px-6">
        <BrandLogo href="/" />

        <nav
          className="flex items-center gap-1 rounded-xl bg-[var(--color-surface-subtle)] p-1"
          aria-label="Main"
        >
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-white text-[var(--color-primary)] shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {onShowQr ? (
          <Button type="button" variant="secondary" onClick={onShowQr}>
            Show QR
          </Button>
        ) : (
          <div className="w-[88px]" aria-hidden />
        )}
      </div>
    </header>
  );
}
