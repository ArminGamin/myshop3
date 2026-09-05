"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { campaign, flags, store } from "@/lib/config/store.config";
import { getDeadlineInfo, formatDeadline, getChristmasCountdown } from "@/lib/config/deadline";
import { SafeDiv } from "@/components/layout/safe-div";

const ROTATE_MS = 4500;

function deadlineMessage(): string | null {
  const deadline = getDeadlineInfo();
  if (deadline.phase === "before" && deadline.deadlineDate) {
    return `Užsisakykite iki ${formatDeadline(deadline.deadlineDate)}! ✨`;
  }
  if (deadline.phase === "near" && deadline.deadlineDate) {
    return deadline.daysLeft === 1
      ? "Paskutinės dienos užsakymams iki Kalėdų — liko 1 diena! ✨"
      : `Paskutinės dienos užsakymams iki Kalėdų — liko ${deadline.daysLeft} dienų! ✨`;
  }
  return null;
}

function christmasMessage(): string | null {
  if (!flags.ENABLE_COUNTDOWN) return null;
  const left = getChristmasCountdown();
  if (left.totalMs <= 0) return "Linksmų Kalėdų! 🤩";
  if (left.days === 0) return "Kalėdos jau šiandien! 🤩";
  if (left.days === 1) return "Iki Kalėdų liko 1 diena! 🤩";
  return `Iki Kalėdų liko ${left.days} dienų! 🤩`;
}

function buildMessages(): string[] {
  return [campaign.announcementText, christmasMessage(), deadlineMessage()].filter(
    (text): text is string => Boolean(text)
  );
}

export function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(() =>
    [campaign.announcementText].filter((text): text is string => Boolean(text))
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMessages(buildMessages());
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    let fadeId = 0;
    const id = window.setInterval(() => {
      setVisible(false);
      fadeId = window.setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setVisible(true);
      }, 280);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(fadeId);
    };
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <SafeDiv className="cta-bar relative z-[60] pt-[env(safe-area-inset-top)]">
      <p
        className={`mx-auto min-h-8 max-w-7xl px-3 py-1.5 text-center text-[12px] font-semibold leading-snug tracking-[0.02em] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-h-10 sm:px-4 sm:py-2 sm:text-[14.75px] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        {messages[index]}
      </p>
      <Link
        href="/pristatymas"
        aria-label="Daugiau apie pristatymą"
        className="absolute inset-0"
        tabIndex={-1}
      />
    </SafeDiv>
  );
}

export function announcementFallbackText() {
  return campaign.announcementText ?? store.brand.tagline;
}
