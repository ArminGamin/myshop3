"use client";

import { useEffect, useSyncExternalStore } from "react";

const ATTR = {
  stickyBuy: "data-sticky-buy",
  cookieBanner: "data-cookie-banner",
  cartOpen: "data-cart-open",
  checkoutOpen: "data-checkout",
} as const;

export function useMobileChromeFlag(flag: keyof typeof ATTR, active: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    const key = ATTR[flag];
    if (active) root.setAttribute(key, "on");
    else root.removeAttribute(key);
    return () => root.removeAttribute(key);
  }, [flag, active]);
}

const queries = new Map<number, MediaQueryList>();

function media(breakpoint: number) {
  let mq = queries.get(breakpoint);
  if (!mq) {
    mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    queries.set(breakpoint, mq);
  }
  return mq;
}

export function useIsMobile(breakpoint = 639) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = media(breakpoint);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => media(breakpoint).matches,
    () => false
  );
}
