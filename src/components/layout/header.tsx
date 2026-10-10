"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Heart, House, Menu, Search, ShieldCheck, ShoppingBag, Sparkles, TreePine, Truck, Watch, X } from "lucide-react";
import { collections } from "@/lib/data/collections";
import { countOf, useCart } from "@/lib/cart/context";
import { useWishlist } from "@/lib/behavior/storage";
import { usePresence } from "@/lib/motion";
import { BrandLogo } from "./brand-logo";
import { SafeDiv } from "./safe-div";

const SearchOverlay = dynamic(
  () => import("./search-overlay").then((m) => ({ default: m.SearchOverlay })),
  { ssr: false }
);

const desktopNav = [
  { href: "/dovanos/visos-dovanos", label: "Kalėdinės dovanos", icon: TreePine, tone: "#1f7a58" },
  { href: "/dovanos/dovanos-jai", label: "Dovanos jai", icon: Heart, tone: "#d4405f" },
  { href: "/dovanos/dovanos-jam", label: "Dovanos jam", icon: Watch, tone: "#2a6f9a" },
  { href: "/dovanos/dovanos-seimai", label: "Dovanos šeimai", icon: House, tone: "#c98620" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();
  const pathname = usePathname();

  const count = countOf(cart.lines);

  useEffect(() => {
    // Būsena atnaujinama tik peržengus ribą, o ne kiekvieno slinkimo metu.
    let last = false;
    const onScroll = () => {
      const next = window.scrollY > 8;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
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
      <header className={`site-header nav-shell ${scrolled ? "is-scrolled" : ""}`}>
        <SafeDiv className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-2.5 sm:gap-2 sm:px-6 lg:h-16 lg:gap-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Atidaryti meniu"
            aria-expanded={menuOpen}
            className="nav-icon nav-menu-btn"
          >
            <Menu className="size-5.5" strokeWidth={1.8} />
          </button>

          <BrandLogo />

          <nav aria-label="Pagrindinė navigacija" className="hidden flex-1 xl:block">
            <ul className="flex items-center justify-center gap-0.5 xl:gap-1.5">
              {desktopNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="nav-chip group"
                    style={{ "--tone": item.tone } as CSSProperties}
                  >
                    <span aria-hidden className="nav-chip-icon">
                      <item.icon className="size-[0.9rem]" strokeWidth={2} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dovanos/dovanos-iki-30-euru"
                  aria-current={pathname === "/dovanos/dovanos-iki-30-euru" ? "page" : undefined}
                  className="nav-pill hero-cta"
                >
                  Iki 30 €
                </Link>
              </li>
            </ul>
          </nav>

          <SafeDiv className="ml-auto flex items-center gap-0.5 sm:gap-1 xl:ml-0 xl:w-44 xl:justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchMounted(true);
                setSearchOpen(true);
              }}
              aria-label="Paieška"
              className="nav-icon"
            >
              <Search className="size-5.5" strokeWidth={1.8} />
            </button>
            <Link
              href="/issaugotos-dovanos"
              aria-label={`Pageidavimų sąrašas${wishlist.items.length ? ` (${wishlist.items.length})` : ""}`}
              className="nav-icon relative"
            >
              <Heart className="size-5.5" strokeWidth={1.8} />
              <span className="sr-only">Išsaugotos dovanos</span>
              {wishlist.items.length > 0 ? (
                <span className="nav-badge">{wishlist.items.length}</span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={cart.openDrawer}
              aria-label={`Krepšelis${count ? ` (${count} prekės)` : " — tuščias"}`}
              className="nav-icon nav-icon-cart relative"
            >
              <span key={count} className="nav-jingle flex">
                <ShoppingBag className="size-5.5" strokeWidth={1.8} />
              </span>
              {count > 0 && cart.hydrated ? <span key={`b-${count}`} className="nav-badge nav-badge-cart">{count}</span> : null}
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
  const menuItems: { href: string; label: string; accent?: boolean; pill?: boolean }[] = [
    { href: "/rask-dovana", label: "Rasti dovaną", accent: true },
    ...collections
      .slice(0, 7)
      .filter((c) => c.slug !== "bestselleriai")
      .map((c) => ({
      href: `/dovanos/${c.slug}`,
      label: c.title,
    })),
    { href: "/dovanos/dovanos-iki-30-euru", label: "Iki 30 €", pill: true },
    { href: "/dovanos/premium-dovanos", label: "Premium dovanos" },
    { href: "/issaugotos-dovanos", label: "Išsaugotos dovanos" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] xl:hidden">
      <div
        className={`overlay-backdrop absolute inset-0 bg-forest-700/55 backdrop-blur-[2px] ${visible ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <nav
        aria-label="Mobilusis meniu"
        className={`menu-panel overlay-panel overlay-panel-left absolute inset-y-0 left-0 flex w-[min(86%,22rem)] max-w-sm flex-col pt-[env(safe-area-inset-top)] shadow-drawer ${visible ? "is-visible" : ""}`}
      >
        <div className="menu-head flex h-14 items-center justify-between px-4 sm:h-16 sm:px-5">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti meniu"
            className="cart-close inline-flex size-11 items-center justify-center rounded-full"
          >
            <X className="size-5" strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {menuItems
            .filter((item) => item.accent)
            .map((item) => (
              <Link key={item.href} href={item.href} onClick={onClose} className="menu-finder group">
                <Sparkles aria-hidden className="size-5 shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{item.label}</span>
                <ArrowRight aria-hidden className="size-4.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>
            ))}
          <ul className="mt-3">
            {menuItems
              .filter((item) => !item.accent)
              .map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={onClose} className={item.pill ? "menu-link menu-link-pill" : "menu-link"}>
                    <span>{item.label}</span>
                    <ArrowRight aria-hidden className="menu-link-arrow size-4" strokeWidth={2} />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="menu-foot pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <p><Truck aria-hidden className="size-4" strokeWidth={1.8} /> Nemokamas pristatymas nuo 80 €</p>
          <p><ShieldCheck aria-hidden className="size-4" strokeWidth={1.8} /> Saugus atsiskaitymas</p>
        </div>
      </nav>
    </div>
  );
}
