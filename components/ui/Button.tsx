"use client";

import React from "react";

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-rose-700 text-white hover:bg-rose-800"
      : variant === "secondary"
        ? "bg-white border border-black/10 text-zinc-900 hover:bg-zinc-50"
        : "bg-transparent text-zinc-800 hover:bg-black/5";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

