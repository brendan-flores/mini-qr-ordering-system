"use client";

import type { CategoryTab } from "./CategoryTabs";

const mobileTabs: { label: string; value: CategoryTab }[] = [
  { label: "All", value: "All Items" },
  { label: "Starters", value: "Starters" },
  { label: "Mains", value: "Mains" },
  { label: "Desserts", value: "Desserts" },
  { label: "Drinks", value: "Beverages" },
];

export function MobileCategoryTabs({
  value,
  onChange,
}: {
  value: CategoryTab;
  onChange(next: CategoryTab): void;
}) {
  return (
    <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
      {mobileTabs.map(({ label, value: tabValue }) => {
        const active = tabValue === value;
        return (
          <button
            key={tabValue}
            type="button"
            onClick={() => onChange(tabValue)}
            className={[
              "shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-transform active:scale-95",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "border border-[var(--color-surface-line)] bg-[#dee9fc] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
