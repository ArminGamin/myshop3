import Link from "next/link";
import { store } from "@/lib/config/store.config";
import { collections } from "@/lib/data/collections";
import { PaymentIcons } from "@/components/commerce/payment-icons";
import { CookieSettingsButton } from "@/components/layout/cookie-settings-button";
import { SafeDiv } from "@/components/layout/safe-div";

const infoLinks = [
  { href: "/apie-mus", label: "Apie mus" },
  { href: "/kontaktai", label: "Kontaktai" },
  { href: "/pristatymas", label: "Pristatymas" },
  { href: "/grazinimas", label: "Grąžinimas" },
  { href: "/duk", label: "DUK" },
];

const legalLinks = [
  { href: "/privatumo-politika", label: "Privatumo politika" },
  { href: "/slapuku-politika", label: "Slapukų politika" },
  { href: "/pirkimo-taisykles", label: "Pirkimo taisyklės" },
];

export function Footer() {
  return (
    <footer className="band-forest relative z-[2] text-cream-100" suppressHydrationWarning>
      <SafeDiv className="mx-auto max-w-7xl px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-12">
        <SafeDiv className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          <SafeDiv className="col-span-2 lg:col-span-1">
            <p className="font-display text-2xl font-extrabold text-cream-50">
              {store.brand.name}
            </p>
            <p className="mt-3 max-w-xs text-[13.5px] font-bold leading-relaxed text-cream-50">
              {store.brand.tagline}. Kruopščiai parinktos dovanos, kurios namus pripildo šilumos! ❤️
            </p>
            <SafeDiv className="mt-5 flex gap-2">
              <SocialLink href={store.social.instagram} label="Instagram" icon={<IgIcon />} />
              <SocialLink href={store.social.facebook} label="Facebook" icon={<FbIcon />} />
              <SocialLink href={store.social.tiktok} label="TikTok" icon={<TtIcon />} />
            </SafeDiv>
          </SafeDiv>

          <nav aria-label="Parduotuvė">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              Parduotuvė
            </p>
            <ul className="space-y-2.5 text-[13.5px]">
              {collections.slice(1, 8).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/dovanos/${c.slug}`}
                    className="text-cream-100/85 transition hover:text-gold-300"
                  >
                    {c.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informacija">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              Informacija
            </p>
            <ul className="space-y-2.5 text-[13.5px]">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream-100/85 transition hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream-100/70 transition hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <SafeDiv>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
              Kontaktai
            </p>
            <ul className="space-y-2.5 text-[13.5px] text-cream-100/85">
              <li>
                <a href={`mailto:${store.contact.email}`} className="transition hover:text-gold-300">
                  {store.contact.email}
                </a>
              </li>
              <li>{store.contact.responseTime}</li>
            </ul>
            <CookieSettingsButton />
          </SafeDiv>
        </SafeDiv>

        <SafeDiv className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-cream-100/15 pt-5 sm:flex-row">
          <p className="text-xs text-cream-100/55">
            © 2026 {store.brand.name}. Visos teisės saugomos.
          </p>
          <PaymentIcons tone="light" />
        </SafeDiv>
      </SafeDiv>
    </footer>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-[10px] border border-cream-100/20 text-cream-100/80 transition hover:border-gold-300 hover:text-gold-300"
    >
      {icon}
    </a>
  );
}

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7z" />
    </svg>
  );
}
function TtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v2.9c-1.4 0-2.7-.4-3.9-1.2v5.6c0 3.4-2.4 5.6-5.5 5.6A5.3 5.3 0 0 1 5.5 14c0-3 2.3-5.3 5.4-5.3.3 0 .7 0 1 .1v3a2.4 2.4 0 0 0-3.4 2.2 2.4 2.4 0 0 0 2.4 2.5c1.5 0 2.7-1.1 2.7-3.1V3z" />
    </svg>
  );
}
