"use client";

import { useEffect } from "react";

const AWAY = "👀 Jau išeini?";
const INTERVAL_MS = 1400;

function officialTitle(title: string) {
  if (title === AWAY) return "";
  return title.replace(/^🎄\s*/u, "").trim();
}

export function TabTitleFlash() {
  useEffect(() => {
    let saved = officialTitle(document.title);
    let timer = 0;
    let showHome = false;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
      document.title = saved;
    };

    const start = () => {
      const current = officialTitle(document.title);
      if (current) saved = current;
      showHome = false;
      document.title = AWAY;
      timer = window.setInterval(() => {
        showHome = !showHome;
        document.title = showHome ? saved : AWAY;
      }, INTERVAL_MS);
    };

    const onVisibility = () => {
      if (document.hidden) start();
      else stop();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  return null;
}