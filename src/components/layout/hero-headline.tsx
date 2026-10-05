"use client";

import { Fragment, useCallback, useSyncExternalStore, type CSSProperties } from "react";
import { campaign } from "@/lib/config/store.config";
import { track } from "@/lib/analytics";

const AB_KEY = "jaukumas.ab-hero.v1";
const noopSubscribe = () => () => {};
const EMPHASIS_WORDS = 2;

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
// Paskutiniai du žodžiai išryškinami kursyvu su auksiniu brūkšniu.
export function HeroHeadline() {
  const getSnapshot = useCallback(() => readVariant(), []);
  const getServer = useCallback(() => "a" as const, []);
  const variant = useSyncExternalStore<"a" | "b">(
    noopSubscribe,
    getSnapshot,
    getServer
  );

  const words = (variant === "a" ? campaign.heroHeadlineA : campaign.heroHeadlineB).split(" ");
  const lead = words.slice(0, -EMPHASIS_WORDS);
  const emphasis = words.slice(-EMPHASIS_WORDS);

  return (
    <>
      {lead.map((word, i) => (
        <Fragment key={`${variant}-${i}`}>
          <span className="hero-word" style={{ "--i": i } as CSSProperties}>
            {word}
          </span>{" "}
        </Fragment>
      ))}
      <em className="hero-em">
        {emphasis.map((word, i) => (
          <Fragment key={`${variant}-em-${i}`}>
            {i > 0 ? " " : null}
            <span className="hero-word" style={{ "--i": lead.length + i } as CSSProperties}>
              {word}
            </span>
          </Fragment>
        ))}
        <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="hero-swash">
          <path pathLength={1} d="M3 13.5C62 5.5 128 3 196 5.2c36 1.2 70 4 101 8.3" />
        </svg>
      </em>
    </>
  );
}
