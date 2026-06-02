"use client";

import { useTable } from "./TableProvider";
import { MaterialIcon } from "../ui/MaterialIcon";

export function TableBadge({ className = "" }: { className?: string }) {
  const { tableNumber } = useTable();

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-surface-line)] bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--color-primary)] shadow-sm",
        className,
      ].join(" ")}
      suppressHydrationWarning
    >
      <MaterialIcon name="table_restaurant" filled={false} className="text-base" />
      Table {tableNumber}
    </span>
  );
}
