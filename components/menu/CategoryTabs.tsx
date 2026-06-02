"use client";

const tabs = ["All Items", "Starters", "Mains", "Desserts", "Beverages"] as const;
export type CategoryTab = (typeof tabs)[number];
export type ProductCategory = Exclude<CategoryTab, "All Items">;

export function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryTab;
  onChange(next: CategoryTab): void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const active = t === value;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              "cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-surface-line)] bg-white text-zinc-700 hover:bg-[var(--color-surface-subtle)]",
            ].join(" ")}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

