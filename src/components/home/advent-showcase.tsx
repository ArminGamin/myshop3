import Link from "next/link";
import { ArrowRight, CalendarDays, Gift, Truck } from "lucide-react";
import type { Product, RecipientId } from "@/types";
import { products } from "@/lib/data/products";
import { productRank } from "@/lib/data/product-order";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { HomeHeading, HomeMoreMobile } from "@/components/home/home-heading";
import { AdventTabs } from "./advent-tabs";

const ADVENT_HREF = "/dovanos/advento-kalendoriai";

const GROUPS: { id: RecipientId; label: string; title: string; text: string; cover: string }[] = [
  {
    id: "jai",
    label: "Jai",
    title: "Kalendoriai jai",
    text: "Grožio ritualai, auksinės smulkmenos ir jaukūs vakarai – po staigmeną kiekvieną gruodžio rytą.",
    cover: "advento-kalendorius-jaukumo-vakarai",
  },
  {
    id: "jam",
    label: "Jam",
    title: "Kalendoriai jam",
    text: "Kava iš viso pasaulio, meistro įrankiai ir linksmos kojinės – laukimas, kuris tikrai praverčia.",
    cover: "advento-kalendorius-kavos-kelione",
  },
  {
    id: "vaikams",
    label: "Vaikams",
    title: "Kalendoriai vaikams",
    text: "Konstravimas, lenktynės, mokslas, slime ir kūryba – kad laukti Kalėdų būtų dar smagiau.",
    cover: "advento-kalendorius-spalvu-pasaka",
  },
];

// Kortelėje rodoma turinio nuotrauka (3-ioji) – ji geriausiai parodo, kas viduje.
function contentsFirst(product: Product): Product {
  const [front, open, contents, ...rest] = product.images;
  if (!contents) return product;
  return { ...product, images: [contents, front, open, ...rest].filter(Boolean) };
}

export function AdventShowcase() {
  const advent = products
    .filter((p) => p.inStock && p.slug.startsWith("advento-kalendorius-"))
    .sort((a, b) => productRank(a.slug) - productRank(b.slug));
  const groups = GROUPS.map((group) => ({
    ...group,
    items: advent.filter((p) => p.recipients.includes(group.id)),
  })).filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;
  const fromCents = Math.min(...advent.map((p) => p.priceCents));

  return (
    <section className="advent-band" aria-labelledby="advent-heading">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="advent-eyebrow">
          <span className="advent-eyebrow-tag">Nauja</span>
          Advento kalendoriai 2026
        </p>
        <HomeHeading
          id="advent-heading"
          title={
            <>
              Advento kalendoriai <em>visai šeimai</em>
            </>
          }
          sub={`24 staigmenos – po vieną kiekvienam gruodžio rytui. Užpildyti, paruošti dovanoti, nuo ${formatPrice(fromCents)} su nemokamu pristatymu.`}
          action={{ href: ADVENT_HREF, label: "Visi advento kalendoriai" }}
        />

        <ul className="advent-perks" aria-label="Advento kalendorių privalumai">
          <li>
            <CalendarDays aria-hidden className="size-4" strokeWidth={1.9} />
            24 langeliai iki Kalėdų
          </li>
          <li>
            <Truck aria-hidden className="size-4" strokeWidth={1.9} />
            Nemokamas pristatymas
          </li>
          <li>
            <Gift aria-hidden className="size-4" strokeWidth={1.9} />
            Paruošta dovanoti
          </li>
        </ul>

        <div className="mt-7 sm:mt-9">
          <AdventTabs
            tabs={groups.map((g) => ({ id: g.id, label: g.label, count: g.items.length }))}
            panels={groups.map((group) => {
              const cover = advent.find((p) => p.slug === group.cover) ?? group.items[0];
              const coverImage = cover.images[3] ?? cover.images[0];
              const tall = group.items.length > 3;
              const groupFrom = Math.min(...group.items.map((p) => p.priceCents));
              return (
                <div key={group.id} className="advent-panel">
                  <Link
                    href={ADVENT_HREF}
                    className={`advent-feature group ${tall ? "lg:row-span-2" : ""}`}
                  >
                    <span className="advent-feature-media">
                      <ProductImage
                        fill
                        images={[coverImage]}
                        seed={cover.artSeed}
                        alt={`${group.title} – ${cover.name}`}
                        size="hero"
                        sizes="(min-width: 1024px) 19rem, 100vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="advent-feature-body">
                      <span className="advent-feature-count">
                        {group.items.length} {group.items.length === 1 ? "kalendorius" : "kalendoriai"}
                      </span>
                      <span className="advent-feature-title">{group.title}</span>
                      <span className="advent-feature-text">{group.text}</span>
                      <span className="advent-feature-foot">
                        <span className="advent-feature-price">nuo {formatPrice(groupFrom)}</span>
                        <span className="advent-feature-cta">
                          Visi kalendoriai <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                        </span>
                      </span>
                    </span>
                  </Link>
                  {group.items.map((product) => (
                    <div key={product.slug} className="advent-card">
                      <ProductCard product={contentsFirst(product)} />
                    </div>
                  ))}
                </div>
              );
            })}
          />
        </div>

        <HomeMoreMobile href={ADVENT_HREF} label="Visi advento kalendoriai" />
      </div>
    </section>
  );
}
