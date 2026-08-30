"use client";

import { useCallback, useSyncExternalStore } from "react";
import { campaign } from "@/lib/config/store.config";
import { track } from "@/lib/analytics";

const AB_KEY = "jaukumas.ab-hero.v1";
const noopSubscribe = () => () => {};

function readVariant(): "a" | "b" {
  try {
    const existing = localStorage.getItem(AB_KEY);
    if (existing === "a" || existing === "b") return existing;
    const assigned = Math.random() < 0.5 ? ("a" as const) : ("b" as const);
    localStorage.setItem(AB_KEY, assigned);
    track("ab_view", { variant: assigned });
    return assigned;
  } catch {
    return "a";
  }
}

// Hero antraštės A/B testas: variantas priskiriamas vieną kartą ir išlieka
// nuoseklus. Serveris visada renderuoja variantą „a" (SEO draugiška).
export function HeroHeadline() {
  const getSnapshot = useCallback(() => readVariant(), []);
  const getServer = useCallback(() => "a" as const, []);
  const variant = useSyncExternalStore<"a" | "b">(
    noopSubscribe,
    getSnapshot,
    getServer
  );

  return <>{variant === "a" ? campaign.heroHeadlineA : campaign.heroHeadlineB}</>;
}
