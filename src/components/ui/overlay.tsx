"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MOTION, usePresence } from "@/lib/motion";

export function Overlay({
  open,
  onClose,
  label,
  children,
  side = "right",
  widthClass = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  side?: "right" | "bottom";
  widthClass?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePresence(open, MOTION.overlayExit);

  useEffect(() => {
    if (!mounted) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.veil = "on";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    if (visible) focusables()[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
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
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      delete document.documentElement.dataset.veil;
      previouslyFocused?.focus();
    };
  }, [mounted, visible, onClose]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
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
        className={`overlay-panel absolute bg-cream-50 shadow-drawer ${
          side === "right"
            ? `overlay-panel-right inset-y-0 right-0 flex h-dvh max-h-dvh w-full ${widthClass} flex-col overflow-hidden pt-[env(safe-area-inset-top)]`
            : "overlay-panel-bottom inset-x-0 bottom-0 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-cozy pb-[env(safe-area-inset-bottom)]"
        } ${visible ? "is-visible" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
