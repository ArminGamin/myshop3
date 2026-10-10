"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { campaign, flags, store } from "@/lib/config/store.config";
import {
  getDeadlineInfo,
  formatDeadline,
  daysUntilChristmasEve,
  lithuanianDayWord,
} from "@/lib/config/deadline";
import { SafeDiv } from "@/components/layout/safe-div";

const ROTATE_MS = 4500;

function deadlineMessage(): { text: string; sparkle: boolean } | null {
  const deadline = getDeadlineInfo();
  if (!deadline.deadlineDate || deadline.phase === "none") return null;
  if (deadline.phase === "near" && deadline.daysLeft != null) {
    return {
      text: `Paskutinės dienos užsakymams iki Kalėdų — liko ${deadline.daysLeft} ${lithuanianDayWord(deadline.daysLeft)}!`,
      sparkle: true,
    };
  }
  return { text: `Užsisakykite iki ${formatDeadline(deadline.deadlineDate)}!`, sparkle: true };
}

function christmasMessage(): { text: string; sparkle: boolean } | null {
  if (!flags.ENABLE_COUNTDOWN) return null;
  const days = daysUntilChristmasEve();
  if (days <= 0) return { text: "Linksmų Kalėdų!", sparkle: true };
  if (days === 1) return { text: "Iki Kalėdų liko 1 diena!", sparkle: false };
  return { text: `Iki Kalėdų liko ${days} ${lithuanianDayWord(days)}!`, sparkle: false };
}

function buildMessages(): { text: string; sparkle: boolean }[] {
  const campaignLine = campaign.announcementText
    ? { text: campaign.announcementText, sparkle: false }
    : null;
  return [campaignLine, christmasMessage(), deadlineMessage()].filter(
    (item): item is { text: string; sparkle: boolean } => Boolean(item)
  );
}

function BannerSparkle() {
  return (
    <svg viewBox="0 0 16 16" className="announce-spark size-3 shrink-0 text-gold-300" aria-hidden="true">
      <path fill="currentColor" d="M8 0 L9.1 6.2 L16 8 L9.1 9.8 L8 16 L6.9 9.8 L0 8 L6.9 6.2 Z" />
    </svg>
  );
}

// Gale esantis jaustukas turi platų dešinį tarpą, todėl tekstas atrodo pasislinkęs į kairę.
function AnnouncementText({ text }: { text: string }) {
  const match = text.match(/^(.*?)\s*(\p{Extended_Pictographic}️?)$/u);
  if (!match) return <>{text}</>;
  return (
    <span>
      {match[1]} <span className="announce-emoji">{match[2]}</span>
    </span>
  );
}

const campaignOnly = campaign.announcementText
  ? [{ text: campaign.announcementText, sparkle: false }]
  : [];

let clientMessages: { text: string; sparkle: boolean }[] | null = null;

function readMessages() {
  if (!clientMessages) clientMessages = buildMessages();
  return clientMessages;
}

function emptySubscribe() {
  return () => {};
}

export function AnnouncementBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const messages = useSyncExternalStore(emptySubscribe, readMessages, () => campaignOnly);
  const [index, setIndex] = useState(0);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const sync = () => {
      document.documentElement.style.setProperty("--announcement-bar-h", `${el.offsetHeight}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--announcement-bar-h");
    };
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [messages.length]);

  if (messages.length === 0) return null;

  // Visi pranešimai sukrauti vienoje vietoje ir keičiamas tik jų matomumas:
  // tekstas DOM'e nesikeičia, todėl iOS Safari nepalieka senų raidžių likučių.
  return (
    <SafeDiv ref={barRef} className="cta-bar announce relative z-[60] flex justify-center pt-[env(safe-area-inset-top)]">
      <div className="announce-stack min-h-8 w-full px-4 py-1.5 text-center text-[12px] font-semibold leading-snug tracking-[0.02em] sm:min-h-10 sm:py-2 sm:text-[13.5px] sm:tracking-[0.04em]">
        {messages.map((message, i) => (
          <p
            key={message.text}
            className={`announce-msg ${i === index ? "is-active" : ""}`}
            aria-hidden={i !== index}
            aria-live={i === index ? "polite" : undefined}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <BannerSparkle />
              <AnnouncementText text={message.text} />
              <BannerSparkle />
            </span>
          </p>
        ))}
      </div>
      <Link
        href="/pristatymas"
        aria-label="Daugiau apie pristatymą"
        className="absolute inset-0"
        tabIndex={-1}
      >
        <span className="sr-only">Daugiau apie pristatymą</span>
      </Link>
    </SafeDiv>
  );
}

export function announcementFallbackText() {
  return campaign.announcementText ?? store.brand.tagline;
}
