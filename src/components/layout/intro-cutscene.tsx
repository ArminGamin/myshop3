"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { markMotionReady, MOTION } from "@/lib/motion";
import { store } from "@/lib/config/store.config";

type IntroPhase = "off" | "hold" | "split" | "done";

export function IntroCutscene() {
  const [phase, setPhase] = useState<IntroPhase>("off");

  const finish = useCallback(() => {
    document.getElementById("intro-static")?.remove();
    document.documentElement.removeAttribute("data-intro");
    markMotionReady();
    setPhase("done");
  }, []);

  useLayoutEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* ignore */
    }

    if (reduced) {
      document.getElementById("intro-static")?.remove();
      document.documentElement.removeAttribute("data-intro");
      markMotionReady();
      setPhase("done");
      return;
    }

    if (document.documentElement.dataset.intro !== "pending") {
      document.getElementById("intro-static")?.remove();
      setPhase("done");
      return;
    }

    document.getElementById("intro-static")?.remove();
    setPhase("hold");
    const splitAt = window.setTimeout(() => setPhase("split"), MOTION.introHold);
    const endAt = window.setTimeout(finish, MOTION.introHold + MOTION.introCurtain + 60);
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
