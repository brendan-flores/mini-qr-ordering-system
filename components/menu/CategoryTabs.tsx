"use client";

const tabs = ["All Items", "Starters", "Mains", "Desserts", "Beverages"] as const;
export type CategoryTab = (typeof tabs)[number];

export function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryTab;
  onChange(next: CategoryTab): void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t === value;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-rose-700 text-white"
                : "bg-white text-zinc-700 border border-black/10 hover:bg-zinc-50",
            ].join(" ")}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

