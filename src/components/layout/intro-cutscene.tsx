"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { markMotionReady, MOTION } from "@/lib/motion";
import { store } from "@/lib/config/store.config";

type IntroPhase = "off" | "hold" | "split" | "done";

function curtain() {
  return document.getElementById("intro-static");
}

function splitCurtain() {
  const el = curtain();
  if (!el) return;
  el.classList.add("is-leaving");
  el.querySelector(".intro-panel-top")?.classList.add("intro-split-top");
  el.querySelector(".intro-panel-bottom")?.classList.add("intro-split-bottom");
}

export function IntroCutscene() {
  const [phase, setPhase] = useState<IntroPhase>("off");

  const finish = useCallback(() => {
    document.documentElement.removeAttribute("data-intro");
    curtain()?.remove();
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

    if (reduced || document.documentElement.dataset.intro !== "pending") {
      finish();
      return;
    }

    setPhase("hold");
    const splitAt = window.setTimeout(() => setPhase("split"), MOTION.introHold);
    const endAt = window.setTimeout(finish, MOTION.introHold + MOTION.introCurtain + 60);
    return () => {
      window.clearTimeout(splitAt);
      window.clearTimeout(endAt);
    };
  }, [finish]);

  useLayoutEffect(() => {
    if (phase === "split") splitCurtain();
  }, [phase]);

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
      className="intro-skip"
      onClick={finish}
    />
  );
}
