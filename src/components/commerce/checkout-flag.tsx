"use client";

import { useLayoutEffect } from "react";

export function CheckoutFlag() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.checkout = "on";
    root.dataset.motionReady = "1";
    root.removeAttribute("data-intro");
    document.getElementById("intro-static")?.remove();
    window.dispatchEvent(new Event("motion-ready"));
    return () => {
      delete root.dataset.checkout;
    };
  }, []);

  return null;
}
