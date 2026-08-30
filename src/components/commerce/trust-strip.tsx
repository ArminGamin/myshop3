import { Star } from "lucide-react";
import { store } from "@/lib/config/store.config";

// Pasitikėjimo juosta — tik teiginiai, atitinkantys realią veiklą
// (ES 14 d. grąžinimas, Stripe saugumas, pristatymas Lietuvoje).
export function TrustStrip({ tone = "light" }: { tone?: "light" | "cream" }) {
  const items = [
    { icon: <Star className="size-4.5" strokeWidth={1.8} />, label: "Kruopščiai parinktos dovanos" },
    { icon: <ShieldIcon />, label: "Saugus atsiskaitymas per Stripe" },
    { icon: <TruckIcon />, label: `Nemokamas pristatymas nuo ${store.shipping.freeThresholdCents / 100} €` },
    { icon: <UndoIcon />, label: "Grąžinimas per 14 d. d." },
  ];

  return (
    <section
      aria-label="Pasitikėjimo garantijos"
      className={`texture-knit border-y ${
        tone === "light" ? "border-cream-300 bg-white/70 shadow-card" : "border-transparent bg-cream-200/80"
      }`}
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-2.5 px-3 py-3 sm:gap-x-4 sm:gap-y-3 sm:px-6 sm:py-3.5 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-start justify-center gap-1.5 text-[11.5px] font-semibold leading-snug text-ink-600 sm:items-center sm:gap-2 sm:text-[13.5px]"
          >
            <span className="shrink-0 text-burgundy-600">{item.icon}</span>
            {item.label}
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
function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 9h11a5 5 0 0 1 0 10h-6" />
      <path d="M8 5L4 9l4 4" />
    </svg>
  );
}
