"use client";

import { useEffect, useRef } from "react";

// Grąžina true, kai aptinkamas „išeinantis" naudotojas:
// - darbalaukyje: žymeklis palieka langą per viršų;
// - mobiliajame: greitas slinkimas aukštyn po to, kai buvo nuslinkta žemiau 50 %.
export function useExitIntent(onExit: () => void) {
  const cbRef = useRef(onExit);
  const firedRef = useRef(false);

  useEffect(() => {
    cbRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    if (firedRef.current) return;

    let maxScroll = 0;
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let upStreak = 0;

    function onMouseOut(e: MouseEvent) {
      if (firedRef.current) return;
      if (!e.relatedTarget && e.clientY <= 0) {
        firedRef.current = true;
        cleanup();
        cbRef.current();
      }
    }

    function onScroll() {
      if (firedRef.current) return;
      const doc = document.documentElement;
      const percent =
        ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100 || 0;
      maxScroll = Math.max(maxScroll, percent);

      const dy = window.scrollY - lastY;
      lastY = window.scrollY;

      const isTouch = window.matchMedia("(hover: none)").matches;
      if (isTouch && maxScroll > 50) {
        if (dy < -12) {
          upStreak += 1;
          if (upStreak >= 3) {
            firedRef.current = true;
            cleanup();
            cbRef.current();
          }
        } else if (dy > 0) {
          upStreak = 0;
        }
      }
    }

    function cleanup() {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    }

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    return cleanup;
  }, []);

  return () => {
    firedRef.current = true;
  };
}
