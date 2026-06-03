"use client";

import { useTable } from "./TableProvider";
import { MaterialIcon } from "../ui/MaterialIcon";

export function TableBadge({ className = "" }: { className?: string }) {
  const { orderingEnabled, tableNumber } = useTable();

  if (!orderingEnabled) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-surface-line)] bg-white px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm",
        className,
      ].join(" ")}
    >
      <MaterialIcon name="table_restaurant" filled={false} className="text-base" />
      Table {tableNumber}
    </span>
  );
}
