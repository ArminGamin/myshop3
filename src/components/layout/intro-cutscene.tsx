"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { store } from "@/lib/config/store.config";

const KEY = "kaledukampelis.intro.v1";

export function IntroCutscene() {
  const [phase, setPhase] = useState<"off" | "hold" | "split" | "done">("off");

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* sessionStorage may be blocked */
    }
    document.documentElement.removeAttribute("data-intro");
    setPhase("done");
  }, []);

  useLayoutEffect(() => {
    let reduced = false;
    let seen = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* ignore */
    }
    if (reduced || seen) {
      document.documentElement.removeAttribute("data-intro");
      setPhase("done");
      return;
    }
    document.documentElement.dataset.intro = "pending";
    setPhase("hold");
    const splitAt = window.setTimeout(() => setPhase("split"), 1600);
    const endAt = window.setTimeout(finish, 2380);
    return () => {
      window.clearTimeout(splitAt);
      window.clearTimeout(endAt);
    };
  }, [finish]);

  useEffect(() => {
    if (phase === "off" || phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, finish]);

  if (phase === "off" || phase === "done") return null;

  return (
    <div
      role="dialog"
      aria-label={store.brand.name}
      aria-modal="true"
      className={`intro-curtain ${phase === "split" ? "is-leaving" : ""}`}
      onClick={finish}
    >
      <div className={`intro-panel intro-panel-top ${phase === "split" ? "intro-split-top" : ""}`} />
      <div className={`intro-panel intro-panel-bottom ${phase === "split" ? "intro-split-bottom" : ""}`} />
      <div className="intro-center">
        <span className="intro-line" />
        <p className="intro-mark">{store.brand.name}</p>
      </div>
    </div>
  );
}
