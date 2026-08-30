"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Prieinamas modalas/drawer: fokusavimo spąstai, Esc uždarymas,
// fono slinkimo blokavimas.
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

  useEffect(() => {
    if (!open) return;

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

    focusables()[0]?.focus();

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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="animate-fade-in absolute inset-0 bg-forest-700/28 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`absolute bg-cream-50 shadow-drawer ${
          side === "right"
            ? `animate-slide-in-right inset-y-0 right-0 flex h-dvh max-h-dvh w-full ${widthClass} flex-col overflow-hidden pt-[env(safe-area-inset-top)]`
            : `animate-slide-up-mobile inset-x-0 bottom-0 max-h-[88dvh] rounded-t-cozy`
        }`}
      >
        {children}
      </div>
    </div>
  );
}
