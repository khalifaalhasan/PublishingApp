"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768; // harus sama dengan `md` di Tailwind
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches, // nilai di browser
    () => false, // nilai saat render di server: dianggap desktop
  );
}
