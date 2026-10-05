import type { Metadata } from "next";
import Link from "next/link";
import { campaign, store } from "@/lib/config/store.config";
import { getProduct, premiumProducts } from "@/lib/data/products";
import { homeFaqs } from "@/lib/data/faq";
import { formatPrice } from "@/lib/format";
import { faqSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { DeadlineBanner } from "@/components/commerce/deadline-banner";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { HeroHeadline } from "@/components/layout/hero-headline";
import { HeroGarland } from "@/components/layout/hero-garland";
import { HeroShowcase, type HeroSlide } from "@/components/layout/hero-showcase";
import { Reveal } from "@/components/layout/reveal";
import { ReviewsMarquee } from "@/components/commerce/reviews-marquee";
import { RecipientBento } from "@/components/home/recipient-bento";
import { WhyUs } from "@/components/home/why-us";
import { PremiumShowcase } from "@/components/home/premium-showcase";
import { NewsletterPanel } from "@/components/home/newsletter-panel";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Hero vitrinos skaidrės: emocija (megztiniai) ir jaukumas (sniego gaublys, girlianda).
const HERO_SLIDES: { slug: string; image: string; focus: string }[] = [
  {
    slug: "kalediniai-megztiniai-sniego-duetas",
    image: "/products/kalediniai-megztiniai-sniego-duetas-couple-real-v2-af063818.webp",
    focus: "50% 18%",
  },
  {
    slug: "seimos-megztiniai-kaledu-dziaugsmas",
    image: "/products/seimos-megztiniai-kaledu-dziaugsmas-family-real-v2-3f445505.webp",
    focus: "50% 28%",
  },
  {
    slug: "sniego-gaublys-ziemos-pasaka",
    image: "/products/sniego-gaublys-pasaka-q2-c757c15f20.webp",
    focus: "50% 50%",
  },
  {
    slug: "led-girlianda-siltas",
    image: "/products/led-girlianda-lentyna-q2-ac567c7e43.webp",
    focus: "45% 45%",
  },
];

export default function HomePage() {
  const featured = getProduct("namu-kino-projektorius");
  // Premium tinklelyje nekartojame prekių, kurios jau rodomos hero vitrinoje.
  const shown = new Set([featured?.slug, ...HERO_SLIDES.map((slide) => slide.slug)]);
  const premium = premiumProducts()
    .filter((p) => !shown.has(p.slug))
    .slice(0, 4);
  const heroSlides: HeroSlide[] = HERO_SLIDES.flatMap((slide) => {
    const product = getProduct(slide.slug);
    if (!product) return [];
    return [{ ...slide, name: product.name, price: formatPrice(product.priceCents) }];
  });

  return (
    <>
      <section className="hero-shell glow-candle texture-knit relative overflow-hidden">
        <div className="hero-wash" aria-hidden />
        <HeroGarland />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-8 pt-14 sm:gap-14 sm:px-6 sm:pb-16 sm:pt-20 lg:min-h-[min(47rem,calc(100svh-var(--header-stack)-3.25rem))] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="hero-stagger text-left">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-burgundy-700 sm:mb-6 sm:text-[13px]">
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
            <h1 className="hero-title font-display text-[2.4rem] font-bold leading-[1.06] tracking-[-0.012em] text-ink-900 sm:text-[3.6rem] lg:text-[4rem] xl:text-[4.6rem]">
              <HeroHeadline />
            </h1>
            <p className="mt-5 max-w-md text-[15.5px] font-medium leading-relaxed text-ink-600 sm:mt-7 sm:text-lg">
              {campaign.heroSubtext}
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink href="/rask-dovana" size="lg" className="hero-cta w-full sm:w-auto">
                {campaign.primaryCTA}
              </ButtonLink>
              <Link
                href="/dovanos/bestselleriai"
                className="inline-flex min-h-11 items-center justify-center text-[16px] font-semibold text-ink-900 underline decoration-gold-500/70 underline-offset-[6px] transition hover:text-burgundy-600 hover:decoration-burgundy-600"
              >
                {campaign.secondaryCTA}
              </Link>
            </div>
          </div>

          <HeroShowcase slides={heroSlides} />
        </div>
      </section>

      <TrustStrip />

      <Reveal>
        <ReviewsMarquee />
      </Reveal>

      <Reveal className="band-wash">
        <section className="home-recipients band-forest py-14 lg:py-20" aria-labelledby="cat-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              id="cat-heading"
              className="home-h2 home-h2-dark font-display text-[2rem] font-bold leading-[1.06] text-cream-50 sm:text-[2.6rem] lg:text-[3rem]"
            >
              Kam ieškote <em>dovanos?</em>
            </h2>
            <RecipientBento />
          </div>
        </section>
      </Reveal>

      <WhyUs />

      <Reveal className="cv-auto">
        <PremiumShowcase featured={featured} products={premium} />
      </Reveal>

      <DeadlineBanner className="py-10 lg:py-14" />

      <section className="cv-auto mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16" aria-labelledby="faq-heading">
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

      <NewsletterPanel />

      <section className="mx-auto max-w-7xl px-4 pb-6 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-ink-600">
          Parodykite savo dovaną! Pažymėkite mus{" "}
          <a
            href={store.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-burgundy-600 underline underline-offset-4"
          >
            @{store.brand.handle}
          </a>{" "}
          Instagrame
        </p>
      </section>

      <JsonLd data={faqSchema(homeFaqs)} />
    </>
  );
}
