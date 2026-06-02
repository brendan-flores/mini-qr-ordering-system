"use client";

import { Button } from "./Button";

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange(next: number): void;
}) {
  return (
    <div className="flex items-center rounded-md border border-black/10 bg-[var(--color-surface-subtle)]">
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 rounded-md px-0 text-zinc-600 hover:bg-transparent hover:text-[var(--color-primary)]"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        –
      </Button>
      <div className="min-w-6 text-center text-sm font-semibold text-zinc-900">
        {value}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 rounded-md px-0 text-zinc-600 hover:bg-transparent hover:text-[var(--color-primary)]"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}

