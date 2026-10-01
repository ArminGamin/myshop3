"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export const MOTION = {
  introHold: 1600,
  introCurtain: 720,
  overlayExit: 520,
} as const;

export function markMotionReady() {
  document.documentElement.dataset.motionReady = "1";
  window.dispatchEvent(new Event("motion-ready"));
}

export function usePresence(open: boolean, duration = MOTION.overlayExit) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    setVisible(false);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open) {
      let nextRaf = 0;
      const raf = requestAnimationFrame(() => {
        nextRaf = requestAnimationFrame(() => setVisible(true));
      });
      return () => { cancelAnimationFrame(raf); cancelAnimationFrame(nextRaf); };
    }
    const timer = window.setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return { mounted: open || mounted, visible: open && visible };
}

function subscribeMotionReady(listener: () => void) {
  window.addEventListener("motion-ready", listener);
  return () => window.removeEventListener("motion-ready", listener);
}

export function useMotionReady() {
  return useSyncExternalStore(subscribeMotionReady, () => document.documentElement.dataset.motionReady === "1", () => false);
}
