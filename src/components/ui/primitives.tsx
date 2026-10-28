import type { ReactNode } from "react";

export function Badge({
  tone = "burgundy",
  children,
}: {
  tone?: "burgundy" | "gold" | "forest" | "new";
  children: ReactNode;
}) {
  const tones = {
    burgundy: "bg-burgundy-600 text-cream-50",
    gold: "bg-gold-400 text-burgundy-800",
    forest: "bg-forest-600 text-cream-50",
    new: "bg-forest-500 text-gold-200",
  };
  return (
    <span
      className={`${tones[tone]} inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm sm:px-2.5 sm:py-1 sm:text-[11px]`}
    >
      {children}
    </span>
  );
}

// Žvaigždutės žaliuose kvadratėliuose; neužpildytos – pilkos.
export function Stars({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span role="img" aria-label={`Įvertinimas ${value} iš 5`} className="inline-flex items-center gap-[2px] align-middle">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden>
          <rect width="20" height="20" fill={i <= Math.round(value) ? "#00b67a" : "#dcdce6"} />
          <path d="M10 3.4l1.9 4.6 4.9.4-3.7 3.2 1.1 4.8L10 13.9l-4.2 2.5 1.1-4.8-3.7-3.2 4.9-.4z" fill="#fff" />
        </svg>
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-[1.65rem] font-bold leading-snug text-ink-900 sm:text-4xl">
        {title}
      </h2>
      {sub ? <p className="mt-2 text-[15px] font-semibold leading-snug text-ink-600 sm:text-[16px]">{sub}</p> : null}
    </div>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-cozy ${className}`} />;
}
