"use client";

import { useSyncExternalStore } from "react";

/**
 * Live `matchMedia` result. Returns `false` during SSR and hydration, then
 * the real value — so only use it for progressive enhancements whose
 * server-rendered default is acceptable.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
