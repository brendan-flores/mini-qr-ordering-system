import { UI_MOTION, uiStaggerMs } from "./ui-motion";

/** @deprecated Use uiStaggerMs */
export const adminStaggerMs = uiStaggerMs;

/** @deprecated Use UI_MOTION */
export const ADMIN_MOTION = {
  fadeUp: UI_MOTION.fadeUp,
  fadeIn: UI_MOTION.fadeIn,
  scaleIn: UI_MOTION.scaleIn,
  smooth: UI_MOTION.smooth,
} as const;
