"use client";

import { useEffect } from "react";
import { useConsent } from "@/lib/consent";

// Porasčio mygtukas „Slapukų nustatymai“ — vėl atveria sutikimo langą.
export function CookieSettingsButton() {
  const { openManager } = useConsent();

  useEffect(() => {
    const handler = () => openManager();
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-open-cookie-settings]")) handler();
    });
  }, [openManager]);

  return null;
}
