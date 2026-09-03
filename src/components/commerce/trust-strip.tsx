import type { ReactNode } from "react";
import { ShieldCheck, Star } from "lucide-react";
import { store } from "@/lib/config/store.config";

type TrustItem = {
  icon: ReactNode;
  label: string;
  shortLabel: string;
};

// Pasitikėjimo juosta — tik teiginiai, atitinkantys realią veiklą.
export function TrustStrip({ tone = "light" }: { tone?: "light" | "cream" }) {
  const freeFrom = store.shipping.freeThresholdCents / 100;
  const items: TrustItem[] = [
    { icon: <Star className="size-4.5" strokeWidth={1.8} />, label: "Kruopščiai parinktos dovanos", shortLabel: "Kruopšti atranka" },
    { icon: <ShieldIcon />, label: "Saugus atsiskaitymas per Stripe", shortLabel: "Saugus Stripe" },
    {
      icon: <TruckIcon />,
      label: `Nemokamas pristatymas nuo ${freeFrom} €`,
      shortLabel: `Nemokamai nuo ${freeFrom} €`,
    },
    { icon: <ShieldCheck className="size-4.5" strokeWidth={1.8} />, label: "Kokybės garantija", shortLabel: "Kokybės garantija" },
  ];

  return (
    <section
      aria-label="Pasitikėjimo garantijos"
      className={`texture-knit border-y ${
        tone === "light" ? "border-cream-300 bg-white/70 shadow-card" : "border-transparent bg-cream-200/80"
      }`}
    >
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2.5 px-3 py-3 sm:gap-x-7 sm:gap-y-3 sm:px-6 sm:py-3.5 lg:gap-x-10 lg:px-8 xl:gap-x-14">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold leading-snug text-ink-600 sm:gap-2 sm:text-[13.5px]"
          >
            <span className="shrink-0 text-burgundy-600">{item.icon}</span>
            <span className="sm:hidden">{item.shortLabel}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
      <path d="M9.2 12.2l2 2 3.6-4" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="2.5" y="7" width="12" height="9" rx="1.5" />
      <path d="M14.5 10h4l2.5 3v3h-6.5z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}
