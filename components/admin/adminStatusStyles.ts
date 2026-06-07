import type { AdminKitchenStatus } from "@/types/order";
import type { PaymentTab } from "./PaymentStatusTabs";

/** Shared tab / badge styling using app tokens from globals.css */
export type StatusTone = {
  dot: string;
  activeBg: string;
  activeText: string;
  activeRing: string;
  inactiveHover: string;
  badgeActive: string;
  badgeInactive: string;
};

function tone(
  dotClass: string,
  activeBg: string,
  opts?: {
    activeText?: string;
    activeRing?: string;
    inactiveHover?: string;
  }
): StatusTone {
  return {
    dot: dotClass,
    activeBg,
    activeText: opts?.activeText ?? "text-[var(--foreground)]",
    activeRing: opts?.activeRing ?? "ring-[var(--color-surface-line)]",
    inactiveHover:
      opts?.inactiveHover ?? "hover:bg-[var(--color-surface-subtle)]",
    badgeActive:
      "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-[var(--color-surface-line)]",
    badgeInactive:
      "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] ring-[var(--color-surface-line)]",
  };
}

/** Payment tabs — same active styling for every stage */
const PAYMENT_TAB_ACTIVE = tone(
  "bg-[var(--color-primary)]",
  "bg-[var(--color-primary-soft)]",
  {
    activeText: "text-[var(--color-primary-dark)]",
    activeRing: "ring-[var(--color-primary)]/25",
    inactiveHover: "hover:bg-[var(--color-primary-soft)]/40",
  }
);

export const PAYMENT_TAB_TONES: Record<PaymentTab, StatusTone> = {
  Pending: PAYMENT_TAB_ACTIVE,
  Paid: PAYMENT_TAB_ACTIVE,
  Completed: PAYMENT_TAB_ACTIVE,
  Cancelled: PAYMENT_TAB_ACTIVE,
};

/** Kitchen progress — single-hue ladder (primary opacity), not rainbow */
export const KITCHEN_STATUS_TONES: Record<AdminKitchenStatus, StatusTone> = {
  received: tone(
    "bg-[var(--color-primary)]/25",
    "bg-[var(--color-primary-soft)]/40"
  ),
  preparing: tone(
    "bg-[var(--color-primary)]/45",
    "bg-[var(--color-primary-soft)]/55"
  ),
  serving: tone(
    "bg-[var(--color-primary)]/65",
    "bg-[var(--color-primary-soft)]/75"
  ),
  served: tone("bg-[var(--color-primary)]", "bg-[var(--color-primary-soft)]"),
  completed: tone(
    "bg-[var(--color-primary-dark)]",
    "bg-[var(--color-surface-subtle)]",
    { activeText: "text-[var(--color-primary-dark)]" }
  ),
};

export const PAYMENT_BADGE_STYLES: Record<"Pending" | "Paid", string> = {
  Pending:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-[var(--color-surface-line)]",
  Paid: "bg-[var(--color-surface-subtle)] text-[var(--foreground)] ring-[var(--color-surface-line)]",
};

export const KITCHEN_BADGE_STYLES: Record<AdminKitchenStatus, string> = {
  received:
    "bg-[var(--color-primary-soft)]/50 text-[var(--foreground)] ring-[var(--color-surface-line)]",
  preparing:
    "bg-[var(--color-primary-soft)]/70 text-[var(--foreground)] ring-[var(--color-surface-line)]",
  serving:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-[var(--color-surface-line)]",
  served:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-[var(--color-primary)]/20",
  completed:
    "bg-[var(--color-surface-subtle)] text-[var(--color-primary-dark)] ring-[var(--color-surface-line)]",
};

export const FAILED_PAYMENT_BADGE =
  "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] ring-[var(--color-surface-line)]";
