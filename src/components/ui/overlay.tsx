"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MOTION, usePresence } from "@/lib/motion";

function acquireOverlay() {
  const n = Number(document.documentElement.dataset.overlays ?? "0") + 1;
  document.documentElement.dataset.overlays = String(n);
  document.documentElement.dataset.veil = "on";
  document.body.style.overflow = "hidden";
}

function releaseOverlay(previouslyFocused: HTMLElement | null) {
  const n = Math.max(0, Number(document.documentElement.dataset.overlays ?? "1") - 1);
  if (n === 0) {
    delete document.documentElement.dataset.overlays;
    delete document.documentElement.dataset.veil;
    document.body.style.overflow = "";
    previouslyFocused?.focus();
    return;
  }
  document.documentElement.dataset.overlays = String(n);
}

export function Overlay({
  open,
  onClose,
  label,
  children,
  side = "right",
  widthClass = "max-w-md",
  zClass = "z-[70]",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  side?: "right" | "bottom" | "center";
  widthClass?: string;
  zClass?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePresence(open, MOTION.overlayExit);

  useEffect(() => {
    if (!mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    acquireOverlay();
    return () => releaseOverlay(previouslyFocused);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !visible) return;

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, visible, onClose]);

  if (!mounted) return null;

  const panelClass =
    side === "right"
      ? `overlay-panel-right inset-y-0 right-0 flex h-dvh max-h-dvh w-full ${widthClass} flex-col overflow-hidden pt-[env(safe-area-inset-top)]`
      : side === "bottom"
        ? "overlay-panel-bottom inset-x-0 bottom-0 flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-cozy pb-[env(safe-area-inset-bottom)]"
        : `overlay-panel-center left-1/2 top-1/2 flex max-h-[95dvh] w-[calc(100%-1.25rem)] ${widthClass} flex-col overflow-hidden rounded-cozy`;

  return (
    <div className={`pointer-events-none fixed inset-0 ${zClass}`}>
      <div
        className={`overlay-backdrop absolute inset-0 bg-forest-700/32 backdrop-blur-[2px] ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`overlay-panel absolute bg-cream-50 shadow-drawer ${panelClass} ${visible ? "is-visible" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
