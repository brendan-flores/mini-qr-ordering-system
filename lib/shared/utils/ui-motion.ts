/** Shared motion utilities for admin, menu, and customer pages. */

export function uiStaggerMs(index: number, step = 55) {
  return `${index * step}ms`;
}

export const UI_MOTION = {
  fadeUp: "ui-animate-fade-up",
  fadeIn: "ui-animate-fade-in",
  scaleIn: "ui-animate-scale-in",
  countPop: "ui-animate-count-pop",
  modalBackdrop: "ui-animate-modal-backdrop",
  modalPanel: "ui-animate-modal-panel",
  smooth: "ui-transition-smooth",
  live: "ui-live",
} as const;
