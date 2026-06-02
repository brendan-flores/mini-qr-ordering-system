"use client";

import { useSyncExternalStore } from "react";

/** True only after the client has hydrated (safe gate for browser-only UI). */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
