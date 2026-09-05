"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { collections } from "@/lib/data/collections";
import { countOf, useCart } from "@/lib/cart/context";
import { useWishlist } from "@/lib/behavior/storage";
import { store } from "@/lib/config/store.config";
import { usePresence } from "@/lib/motion";
import { BrandLogo } from "./brand-logo";
import { SafeDiv } from "./safe-div";

const SearchOverlay = dynamic(
  () => import("./search-overlay").then((m) => ({ default: m.SearchOverlay })),
  { ssr: false }
);

const desktopNav = [
  { href: "/dovanos/visos-dovanos", label: "Kalėdinės dovanos", tone: "text-cranberry-500 hover:text-cranberry-400" },
  { href: "/dovanos/bestselleriai", label: "Bestselleriai", tone: "text-gold-500 hover:text-gold-400" },
  { href: "/dovanos/dovanos-jai", label: "Dovanos jai", tone: "text-rose-500 hover:text-rose-400" },
  { href: "/dovanos/dovanos-jam", label: "Dovanos jam", tone: "text-pine-500 hover:text-pine-400" },
  { href: "/dovanos/dovanos-seimai", label: "Dovanos šeimai", tone: "text-sky-500 hover:text-sky-400" },
  { href: "/dovanos/dovanos-iki-30-euru", label: "Iki 30 €", tone: "text-copper-500" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();

  const count = countOf(cart.lines);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) document.documentElement.dataset.menuOpen = "on";
    else delete document.documentElement.dataset.menuOpen;
    return () => {
      document.body.style.overflow = "";
      delete document.documentElement.dataset.menuOpen;
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`border-b border-cream-300 bg-cream-50/88 backdrop-blur-md transition-[box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? "shadow-lift" : "shadow-card"
        }`}
      >
        <SafeDiv className="mx-auto flex h-14 max-w-7xl items-center gap-0.5 px-2.5 sm:gap-2 sm:px-6 lg:h-16 lg:gap-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Atidaryti meniu"
            aria-expanded={menuOpen}
            className="nav-glow flex size-10 items-center justify-center rounded-[10px] text-ink-900 sm:size-11 lg:hidden"
          >
            <Menu className="size-5.5" strokeWidth={1.8} />
          </button>

          <BrandLogo />

          <nav aria-label="Pagrindinė navigacija" className="hidden flex-1 lg:block">
            <ul className="flex items-center justify-center gap-1 xl:gap-2">
              {desktopNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      item.href === "/dovanos/dovanos-iki-30-euru"
                        ? `whitespace-nowrap rounded-full border border-copper-400/70 bg-copper-500/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] xl:text-[12px] ${item.tone}`
                        : `nav-glow whitespace-nowrap px-2 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] xl:px-3 xl:text-[12.5px] ${item.tone}`
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <SafeDiv className="ml-auto flex items-center gap-0 sm:gap-1 lg:ml-0 lg:w-44 lg:justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchMounted(true);
                setSearchOpen(true);
              }}
              aria-label="Paieška"
              className="nav-glow flex size-10 items-center justify-center rounded-[10px] text-ink-900 sm:size-11"
            >
              <Search className="size-5.5" strokeWidth={1.8} />
            </button>
            <Link
              href="/issaugotos-dovanos"
              aria-label={`Pageidavimų sąrašas${wishlist.items.length ? ` (${wishlist.items.length})` : ""}`}
              className="nav-glow relative flex size-10 items-center justify-center rounded-[10px] text-ink-900 sm:size-11"
            >
              <Heart className="size-5.5" strokeWidth={1.8} />
              {wishlist.items.length > 0 ? (
                <span className="cta-fill absolute right-1 top-1 flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {wishlist.items.length}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={cart.openDrawer}
              aria-label={`Krepšelis${count ? ` (${count} prekės)` : " — tuščias"}`}
              className="nav-glow relative flex size-10 items-center justify-center rounded-[10px] text-ink-900 sm:size-11"
            >
              <ShoppingBag className="size-5.5" strokeWidth={1.8} />
              {count > 0 && cart.hydrated ? (
                <span className="cta-fill absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white">
                  {count}
                </span>
              ) : null}
            </button>
          </SafeDiv>
        </SafeDiv>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {searchMounted ? (
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      ) : null}
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, visible } = usePresence(open);
  if (!mounted) return null;
  const menuTone: Record<string, string> = {
    "/dovanos/visos-dovanos": "text-cranberry-500",
    "/dovanos/bestselleriai": "text-gold-500",
    "/dovanos/dovanos-jai": "text-rose-500",
    "/dovanos/dovanos-jam": "text-pine-500",
    "/dovanos/dovanos-seimai": "text-sky-500",
    "/dovanos/dovanos-poroms": "text-teal-500",
    "/dovanos/dovanos-iki-20-euru": "text-amber-500",
    "/dovanos/dovanos-iki-30-euru": "text-copper-500",
    "/dovanos/premium-dovanos": "text-indigo-500",
    "/issaugotos-dovanos": "text-forest-400",
    "/kontaktai": "text-plum-500",
  };
  const menuItems: { href: string; label: string; accent?: boolean; pill?: boolean }[] = [
    { href: "/rask-dovana", label: "Rasti dovaną", accent: true },
    ...collections.slice(0, 7).map((c) => ({
      href: `/dovanos/${c.slug}`,
      label: c.title,
    })),
    { href: "/dovanos/dovanos-iki-30-euru", label: "Iki 30 €", pill: true },
    { href: "/dovanos/premium-dovanos", label: "Premium dovanos" },
    { href: "/issaugotos-dovanos", label: "Išsaugotos dovanos" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] lg:hidden">
      <div
        className={`overlay-backdrop absolute inset-0 bg-ink-900/45 ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <nav
        aria-label="Mobilusis meniu"
        className={`overlay-panel overlay-panel-left absolute inset-y-0 left-0 flex w-[min(86%,22rem)] max-w-sm flex-col bg-white pt-[env(safe-area-inset-top)] shadow-drawer ${visible ? "is-visible" : ""}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-cream-400 px-4 sm:h-16 sm:px-5">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti meniu"
            className="flex size-11 items-center justify-center rounded-[10px] hover:bg-cream-200"
          >
            <X className="size-5.5" strokeWidth={1.8} />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto px-3 py-3">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`mb-0.5 block rounded-[12px] px-4 py-3.5 text-[15px] font-bold uppercase tracking-[0.03em] transition ${
                  item.accent
                    ? "cta-fill text-white"
                    : item.pill
                      ? `mx-1 rounded-full border border-copper-400/70 bg-copper-500/12 ${menuTone[item.href] ?? "text-copper-500"}`
                      : `${menuTone[item.href] ?? "text-ink-900"} hover:bg-cream-200`
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-cream-400 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[13px] leading-relaxed text-ink-600">
          <p>Nemokamas pristatymas nuo 80 €</p>
          <p>Kokybės garantija</p>
          <p>Pristatome per 4–6 d.</p>
        </div>
      </nav>
    </div>
  );
}
