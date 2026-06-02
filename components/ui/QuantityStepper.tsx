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
    <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1">
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 px-0"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        –
      </Button>
      <div className="min-w-6 text-center text-sm font-semibold">{value}</div>
      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 px-0"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}

