"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return { mounted, visible };
}

export function useMotionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.motionReady === "1") {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener("motion-ready", onReady);
    return () => window.removeEventListener("motion-ready", onReady);
  }, []);

  return ready;
}
