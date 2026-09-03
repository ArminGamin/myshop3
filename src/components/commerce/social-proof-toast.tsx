"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { flags } from "@/lib/config/store.config";
import { useMobileChromeFlag } from "@/lib/mobile-chrome";
import { useMotionReady } from "@/lib/motion";
import {
  pickNextToast,
  progressKey,
  rand,
  randViewersLt,
  rollPinnedNums,
  sliceLine,
  type ToastSlice,
} from "@/lib/social-proof";

const SPRING = "cubic-bezier(0.22, 1, 0.36, 1)";

export function SocialProofToast() {
  const cart = useCart();
  const motionReady = useMotionReady();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [slice, setSlice] = useState<ToastSlice | null>(null);
  const [displayMs, setDisplayMs] = useState(3000);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [pinned, setPinned] = useState(rollPinnedNums);
  const [viewerCount, setViewerCount] = useState(() => randViewersLt());

  const startTimerRef = useRef<number | null>(null);
  const phaseOutTimerRef = useRef<number | null>(null);
  const afterOutTimerRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const slowPinsTimerRef = useRef<number | null>(null);
  const pinnedRef = useRef(pinned);
  const lastShownKindRef = useRef<ToastSlice["kind"] | null>(null);

  pinnedRef.current = pinned;

  const eligible = flags.ENABLE_SOCIAL_PROOF && !dismissed && !cart.drawerOpen && motionReady;

  const clearCarouselTimersOnly = useCallback(() => {
    [startTimerRef, phaseOutTimerRef, afterOutTimerRef, pauseTimerRef].forEach((r) => {
      if (r.current !== null) {
        window.clearTimeout(r.current);
        r.current = null;
      }
    });
  }, []);

  useEffect(() => {
    if (!eligible) return undefined;
    const tickViewers = () => setViewerCount(randViewersLt());
    tickViewers();
    const id = window.setInterval(tickViewers, 10000);
    return () => window.clearInterval(id);
  }, [eligible]);

  const scheduleSlowPins = useCallback(() => {
    if (slowPinsTimerRef.current !== null) {
      window.clearTimeout(slowPinsTimerRef.current);
      slowPinsTimerRef.current = null;
    }
    function tick() {
      setPinned(rollPinnedNums());
      slowPinsTimerRef.current = window.setTimeout(tick, rand(10, 15) * 60 * 1000);
    }
    slowPinsTimerRef.current = window.setTimeout(tick, rand(10, 15) * 60 * 1000);
  }, []);

  useEffect(() => {
    if (!eligible) {
      if (slowPinsTimerRef.current !== null) {
        window.clearTimeout(slowPinsTimerRef.current);
        slowPinsTimerRef.current = null;
      }
      lastShownKindRef.current = null;
      clearCarouselTimersOnly();
      setVisible(false);
      setSlice(null);
      setPhase("in");
      return undefined;
    }

    scheduleSlowPins();
    return () => {
      if (slowPinsTimerRef.current !== null) {
        window.clearTimeout(slowPinsTimerRef.current);
        slowPinsTimerRef.current = null;
      }
    };
  }, [eligible, scheduleSlowPins, clearCarouselTimersOnly]);

  useEffect(() => {
    if (!eligible) {
      lastShownKindRef.current = null;
      clearCarouselTimersOnly();
      setVisible(false);
      setSlice(null);
      setPhase("in");
      return undefined;
    }

    let cancelled = false;

    const showStep = () => {
      if (cancelled) return;
      const displayFor = rand(2600, 3400);
      const pauseAfter = rand(2600, 4200);

      const next = pickNextToast(pinnedRef.current, lastShownKindRef.current);
      lastShownKindRef.current = next.kind;
      setDisplayMs(displayFor);
      setSlice(next);
      setPhase("in");
      setVisible(true);

      const fadeOutStart = Math.max(120, displayFor - 280);
      phaseOutTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setPhase("out");
        afterOutTimerRef.current = window.setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          pauseTimerRef.current = window.setTimeout(showStep, pauseAfter);
        }, 280);
      }, fadeOutStart);
    };

    clearCarouselTimersOnly();
    startTimerRef.current = window.setTimeout(showStep, 1200);

    return () => {
      cancelled = true;
      clearCarouselTimersOnly();
    };
  }, [eligible, clearCarouselTimersOnly]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    clearCarouselTimersOnly();
  };

  if (!eligible) return null;

  const lineShown = slice ? sliceLine(slice, viewerCount) : "";
  const pk = progressKey(slice, displayMs);

  return (
    <div
      role="status"
      aria-live="polite"
      className="social-proof-toast pointer-events-none fixed left-2.5 z-[45] w-max max-w-[calc(100vw-1.25rem)] transition-[opacity,transform] duration-500 sm:left-4"
      style={{
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionTimingFunction: SPRING,
      }}
    >
      <div className="social-proof-shell relative overflow-hidden rounded-full border border-gold-400/40 shadow-card">
        <div className="flex shrink-0 items-center gap-2 py-2.5 pl-2.5 pr-1.5 sm:gap-2.5 sm:py-3 sm:pl-3 sm:pr-2">
          <span className="relative flex size-2.5 shrink-0 items-center justify-center">
            <span className="social-proof-pulse-ring absolute inset-0 rounded-full bg-gold-400" />
            <span className="social-proof-pulse-dot relative size-2.5 rounded-full bg-gold-400" />
          </span>
          <span
            className="max-w-[min(100%,11.5rem)] whitespace-normal text-center text-[12.5px] font-semibold leading-snug text-cream-50 transition-[opacity,transform] duration-500 sm:max-w-none sm:whitespace-nowrap sm:text-[13.5px]"
            style={{
              opacity: phase === "in" ? 1 : 0,
              transform: phase === "in" ? "translateY(0)" : "translateY(-6px)",
              transitionTimingFunction: SPRING,
            }}
          >
            {lineShown}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Užverti"
            className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full text-cream-50/75 transition hover:bg-cream-50/10 hover:text-cream-50"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
        {slice ? (
          <span
            key={pk}
            aria-hidden
            className="social-proof-progress absolute bottom-0 left-0 h-0.5 w-full origin-left"
            style={{ animationDuration: `${displayMs}ms` }}
          />
        ) : null}
      </div>
    </div>
  );
}
