"use client";

import { useEffect, useState } from "react";

const ATTR = {
  stickyBuy: "data-sticky-buy",
  cookieBanner: "data-cookie-banner",
  cartOpen: "data-cart-open",
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

export function useIsMobile(breakpoint = 639) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);

  return mobile;
}
