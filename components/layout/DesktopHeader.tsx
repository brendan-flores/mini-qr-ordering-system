"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "../brand/BrandLogo";
import { TableBadge } from "../table/TableBadge";
import { useTable } from "../table/TableProvider";
import { MENU_PAGE_PATH } from "@/lib/routes";
import { UI_MOTION } from "@/lib/ui-motion";

const navItems = [
  { href: MENU_PAGE_PATH, label: "Menu" },
  { href: "/orders", label: "Orders" },
] as const;

export function DesktopHeader() {
  const pathname = usePathname();
  const { orderingEnabled } = useTable();

  return (
    <header
      className={`${UI_MOTION.fadeIn} fixed top-0 z-40 hidden h-16 w-full border-b border-[var(--color-surface-line)] bg-white lg:block`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <BrandLogo href={MENU_PAGE_PATH} />
          <TableBadge className="hidden sm:inline-flex" />
        </div>

        {orderingEnabled ? (
          <nav
            className="flex items-center gap-1 rounded-xl bg-[var(--color-surface-subtle)] p-1"
            aria-label="Main"
          >
            {navItems.map((item) => {
              const active =
                item.href === MENU_PAGE_PATH
                  ? pathname === MENU_PAGE_PATH
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
        ) : (
          <div className="flex-1" aria-hidden />
        )}

        <div className="w-[88px] shrink-0" aria-hidden />
      </div>
    </header>
  );
}
