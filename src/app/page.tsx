import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, HeartHandshake, PackageCheck } from "lucide-react";
import { CollectionGlyph, SectionGlyph } from "@/components/ui/line-icons";
import { campaign, store } from "@/lib/config/store.config";
import { bestsellers, getProduct, premiumProducts } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";
import { homeFaqs } from "@/lib/data/faq";
import { formatPrice } from "@/lib/format";
import { faqSchema } from "@/lib/seo/schema";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { DeadlineBanner } from "@/components/commerce/deadline-banner";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { HeroHeadline } from "@/components/layout/hero-headline";
import { Reveal } from "@/components/layout/reveal";
import { NewsletterForm } from "@/components/commerce/newsletter-form";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const trustChips = [
  `Pristatymas per 4–6 d.`,
  `Nemokamai nuo ${store.shipping.freeThresholdCents / 100} €`,
  `Grąžinimas per 14 d.`,
];

export default function HomePage() {
  const best = bestsellers().slice(0, 8);
  const premium = premiumProducts().slice(0, 4);
  const hamper = getProduct("sventinis-dovanu-krepselis");

  return (
    <>
      <section className="glow-candle texture-knit relative overflow-hidden lg:min-h-[80svh]">
        <div className="hero-wash" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-7 px-4 pb-8 pt-6 sm:gap-10 sm:px-6 sm:pb-10 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:pb-16 lg:pt-12">
          <div className="hero-stagger text-left">
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-burgundy-700 sm:mb-5 sm:text-xs sm:tracking-[0.18em]">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="animate-sparkle size-4 shrink-0 text-gold-500"
              >
                <path
                  fill="currentColor"
                  d="M12 1.1 13.7 8.6 21.2 10.4 13.7 12.2 12 19.7 10.3 12.2 2.8 10.4 10.3 8.6Z"
                />
                <path
                  fill="currentColor"
                  d="M19.15 3.2 19.9 6 22.7 6.75 19.9 7.5 19.15 10.3 18.4 7.5 15.6 6.75 18.4 6Z"
                />
              </svg>
              {campaign.heroEyebrow}
            </p>
            <h1 className="font-display text-[1.85rem] font-semibold leading-[1.2] text-ink-900 sm:text-5xl lg:text-[3.55rem] lg:leading-[1.12]">
              <HeroHeadline />
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-600 sm:mt-5 sm:text-base">
              {campaign.heroSubtext}
            </p>
            <div className="mt-5 flex flex-col items-stretch gap-2.5 sm:mt-7 sm:flex-row sm:items-center sm:gap-3">
              <ButtonLink href="/rask-dovana" size="lg" className="w-full sm:w-auto">
                {campaign.primaryCTA}
              </ButtonLink>
              <Link
                href="/dovanos/bestselleriai"
                className="inline-flex min-h-11 items-center justify-center text-[15px] font-semibold text-ink-900 underline decoration-gold-500/70 underline-offset-[6px] transition hover:text-burgundy-600 hover:decoration-burgundy-600"
              >
                {campaign.secondaryCTA}
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gold-400/55 pt-3 text-[12px] font-medium text-ink-600 sm:mt-8 sm:gap-x-5 sm:pt-4 sm:text-[13px]">
              {trustChips.map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-gold-500" aria-hidden />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-cluster relative mx-auto w-full max-w-[22rem] sm:max-w-lg lg:max-w-none">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] sm:max-w-[28rem] lg:max-w-none lg:aspect-[5/6]">
              <HeroCard
                slug="vilnonis-pledas-jaukumas"
                className="absolute left-[4%] top-[2%] z-10 w-[54%] rotate-[-7deg]"
              />
              <HeroCard
                slug="aromaterapijos-zvakide-sventinis-vakaras"
                className="absolute right-[2%] top-[14%] z-20 w-[56%] rotate-[6deg]"
              />
              <HeroCard
                slug="karstojo-sokolado-rinkinys"
                className="absolute bottom-[8%] left-[10%] z-30 w-[50%] rotate-[2.5deg]"
              />
              <HeroCard
                slug="advento-kalendorius-24-malonumai"
                className="absolute bottom-[0%] right-[6%] z-40 w-[44%] rotate-[-4deg]"
              />
            </div>
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              className="animate-sparkle absolute -left-1 top-6 hidden size-8 text-gold-500 sm:block lg:left-0 lg:size-9"
            >
              <path fill="currentColor" d="M50 5l9 36 36 9-36 9-9 36-9-36-36-9 36-9z" />
            </svg>
          </div>
        </div>
      </section>

      <TrustStrip />

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-11" aria-labelledby="best-heading">
          <SectionHeading
            eyebrow="Populiarūs pasirinkimai"
            title="Bestselleriai — išsirinkimo problema išspręsta"
            sub="Šios dovanos mūsų pirkėjus pasiekia dažniausiai. Saugiausias pasirinkimas, kai norisi pataikyti."
          />
          <div className="mt-7">
            <ProductGrid products={best} />
          </div>
          <div className="mt-7 text-center">
            <ButtonLink href="/dovanos/bestselleriai" variant="secondary">
              Visi bestselleriai <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </section>
      </Reveal>

      <Reveal className="band-wash">
        <section className="band-forest py-9 lg:py-11" aria-labelledby="cat-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                Pasirinkite pagal gavėją
              </p>
              <h2 id="cat-heading" className="font-display text-[1.65rem] font-semibold text-cream-50 sm:text-4xl">
                Kam ieškote dovanos?
              </h2>
            </div>
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                collections[2],
                collections[3],
                collections[4],
                collections[5],
                collections[6],
                collections[8],
                collections[9],
              ].map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/dovanos/${c.slug}`}
                    className="group flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-cozy bg-cream-50/95 px-2 py-3.5 text-center shadow-card transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lift sm:min-h-24 sm:gap-2 sm:px-3 sm:py-4"
                  >
                    <span className="text-burgundy-600 transition-transform group-hover:scale-110">
                      <CollectionGlyph slug={c.slug} />
                    </span>
                    <span className="text-[13px] font-bold text-ink-900 sm:text-sm">{c.shortTitle}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/rask-dovana"
                  className="group flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-cozy border border-gold-400/60 bg-gold-400/15 px-2 py-3.5 text-center transition hover:bg-gold-400/30 sm:min-h-24 sm:gap-2 sm:px-3 sm:py-4"
                >
                  <span className="text-gold-200">
                    <SectionGlyph name="search" className="size-6" />
                  </span>
                  <span className="text-[13px] font-bold text-gold-200 sm:text-sm">Rasti dovaną →</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="dovanu-radiklis" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-9 sm:px-6 lg:px-8 lg:py-11" aria-labelledby="quiz-heading">
          <div className="glow-candle texture-knit overflow-hidden rounded-cozy border border-cream-300 bg-cream-100 p-5 shadow-lift sm:p-9">
            <div className="mx-auto max-w-xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                Per 30 sekundžių
              </p>
              <h2 id="quiz-heading" className="font-display text-[1.65rem] font-semibold text-ink-900 sm:text-4xl">
                Nežinote, ką rinktis? Atsakyme į 4 klausimus.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
                Kam dovana, koks biudžetas, koks žmogaus tipas — o mes parodysime geriausiai
                atitinkančias dovanas.
              </p>
              <ButtonLink href="/rask-dovana" size="lg" className="mt-6">
                Rasti mano dovaną →
              </ButtonLink>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="panel-inset border-y border-cream-300 bg-cream-200/80 py-9 lg:py-11" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Kodėl mes"
            title="Dovanos, kurias renkame taip, kaip rinktumėmės savo šeimai"
          />
          <div className="mt-8 grid gap-6 text-center sm:grid-cols-3">
            {[
              {
                icon: <HeartHandshake className="size-7" strokeWidth={1.5} />,
                t: "Kruopšti atranka",
                d: "Kiekviena prekė patenka į katalogą tik po to, kai ją išbandome ir įvertiname patys. Jokių atsitiktinių daiktų.",
              },
              {
                icon: <PackageCheck className="size-7" strokeWidth={1.5} />,
                t: "Paruošta dovanoti",
                d: "Dauguma prekių atkeliauja gražioje pakuotėje — belieka pridėti žinutę. Papildomo pakavimo nereikia.",
              },
              {
                icon: <Gift className="size-7" strokeWidth={1.5} />,
                t: "Jei netiks — grąžinsime",
                d: "Nepatiko ar netiko? Grąžinimas per 14 dienų be paaiškinimų. Dovanų pasirinkimas turėtų džiuginti, ne nervinti.",
              },
            ].map((item) => (
              <div key={item.t} className="flex flex-col items-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-burgundy-100 text-burgundy-600">
                  {item.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{item.t}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-600">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-11" aria-labelledby="prem-heading">
          <SectionHeading
            eyebrow="Įspūdžiui, kuris lieka"
            title="Premium dovanos"
            sub="Kai dovana turi kalbėti pati už save."
          />
          <div className="mt-7">
            <ProductGrid products={premium} />
          </div>
          <div className="mt-7 text-center">
            <ButtonLink href="/dovanos/premium-dovanos" variant="secondary">
              Visos premium dovanos <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </section>
      </Reveal>

      {hamper ? (
        <Reveal>
          <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-14">
            <div className="overflow-hidden rounded-cozy bg-gradient-to-br from-burgundy-700 via-burgundy-600 to-burgundy-800 shadow-lift">
              <div className="grid items-center gap-6 p-5 sm:p-9 lg:grid-cols-[1fr_380px]">
                <div className="order-2 text-cream-100 lg:order-1">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                    Didžiausias efektas vienu pasirinkimu
                  </p>
                  <h2 className="mt-3 font-display text-[1.65rem] font-semibold leading-snug sm:text-4xl">
                    {hamper.name}
                  </h2>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-90">
                    {hamper.tagline} Pirkus atskirai — {formatPrice(hamper.compareAtPriceCents ?? 7200)}.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <span className="font-display text-4xl font-bold text-cream-50">
                      {formatPrice(hamper.priceCents)}
                    </span>
                    <ButtonLink href={`/produktai/${hamper.slug}`} variant="gold" size="lg">
                      Peržiūrėti krepšelį →
                    </ButtonLink>
                  </div>
                </div>
                <div className="order-1 overflow-hidden rounded-cozy shadow-lift lg:order-2">
                  <ProductImage
                    images={hamper.images}
                    seed={hamper.artSeed}
                    alt={hamper.name}
                    size="hero"
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal className="band-wash">
        <section className="band-forest py-9 lg:py-11" aria-labelledby="guide-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
                Dovanų gidai
              </p>
              <h2 id="guide-heading" className="font-display text-[1.65rem] font-semibold text-cream-50 sm:text-4xl">
                Ką dovanoti…?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream-100/75">
                Greiti maršrutai iki tinkamiausių dovanų konkrečiam žmogui.
              </p>
            </div>
            <ul className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[
                { label: "mamai", href: "/dovanos/dovanos-jai" },
                { label: "tėčiui", href: "/dovanos/dovanos-jam" },
                { label: "vaikinui", href: "/dovanos/dovanos-jam" },
                { label: "merginai", href: "/dovanos/dovanos-jai" },
                { label: "draugui", href: "/dovanos/dovanos-seimai" },
                { label: "kolegoms", href: "/dovanos/dovanos-iki-30-euru" },
                { label: "Slaptas Senelis", href: "/dovanos/dovanos-iki-20-euru" },
                { label: "porai", href: "/dovanos/dovanos-poroms" },
              ].map((g) => (
                <li key={g.label}>
                  <Link
                    href={g.href}
                    className="tile-forest flex min-h-[4.5rem] flex-col justify-center overflow-visible rounded-cozy border border-cream-50/15 px-3 py-3.5 transition hover:border-gold-300 sm:min-h-24 sm:px-4 sm:py-4"
                  >
                    <span className="text-[1.05rem] font-bold capitalize leading-[1.4] text-cream-50 sm:text-[1.2rem] sm:leading-[1.45]">
                      {g.label} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      <section className="py-10 lg:py-14">
        <DeadlineBanner />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-14" aria-labelledby="faq-heading">
        <FAQAccordion items={homeFaqs} />
        <p className="mt-6 text-center">
          <Link
            href="/duk"
            className="text-sm font-semibold text-burgundy-600 underline underline-offset-4 hover:text-burgundy-700"
          >
            Visi klausimai ir atsakymai →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" aria-labelledby="nl-heading">
        <div className="texture-knit glow-candle rounded-cozy border border-gold-400/40 bg-gradient-to-br from-cream-100 to-cream-200 p-5 text-center shadow-lift sm:p-9">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-burgundy-100 text-burgundy-600">
            <SectionGlyph name="tree" className="size-6" />
          </span>
          <h2 id="nl-heading" className="mt-3 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
            Gaukite 10 % nuolaidą pirmajam užsakymui
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
            Taip pat sužinosite apie naujas dovanas ir specialius Kalėdinius pasiūlymus.
          </p>
          <div className="mt-6">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-ink-600">
          Parodykite savo dovaną — pažymėkite{" "}
          <a
            href={store.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-burgundy-600 underline underline-offset-4"
          >
            @{store.brand.handle}
          </a>{" "}
          Instagram
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(homeFaqs)) }}
      />
    </>
  );
}

function HeroCard({ slug, className }: { slug: string; className?: string }) {
  const product = getProduct(slug);
  if (!product) return null;
  return (
    <Link
      href={`/produktai/${product.slug}`}
      className={`group block overflow-hidden rounded-cozy bg-white shadow-lift transition duration-700 hover:-translate-y-1 hover:shadow-lift ${className ?? ""}`}
    >
      <div className="aspect-[4/5] overflow-hidden bg-cream-100">
        <ProductImage
          images={product.images}
          seed={product.artSeed}
          alt={product.name}
          size="card"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="border-t border-cream-300/80 px-3 py-2.5">
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-ink-900 sm:text-[12.5px]">{product.name}</p>
        <p className="text-[12px] font-bold text-burgundy-600 sm:text-[13px]">{formatPrice(product.priceCents)}</p>
      </div>
    </Link>
  );
}
