import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Gift,
  PackageOpen,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { store } from "@/lib/config/store.config";
import {
  ADVENT_GROUPS,
  ADVENT_HREF,
  adventProducts,
  calendarWord,
  contentsFirst,
  lifestyleImage,
} from "@/lib/data/advent";
import type { CollectionContent } from "@/lib/data/collection-content";
import { formatPrice } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import type { getArticles } from "@/lib/articles";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { ArticleCard } from "@/components/blog/article-card";
import { JsonLd } from "@/components/seo/json-ld";

const free = formatPrice(store.shipping.freeThresholdCents);

const STEPS = [
  {
    icon: Gift,
    title: "Išsirink pagal pomėgius",
    text: "Grožis, papuošalai, kava, įrankiai ar vaikiški nuotykiai – kiekviename kalendoriuje 24 staigmenos.",
  },
  {
    icon: Truck,
    title: "Atkeliauja per 3–4 dienas",
    text: `Pristatome visoje Lietuvoje, o užsakymams nuo ${free} – nemokamai.`,
  },
  {
    icon: PackageOpen,
    title: "Gruodžio 1-ąją – pirmas langelis",
    text: "Kalendorius jau užpildytas ir paruoštas dovanoti – belieka kasdien atidaryti po staigmeną.",
  },
];

type Props = {
  content: CollectionContent | undefined;
  articles: ReturnType<typeof getArticles>;
};

// Advento kalendorių nukreipimo puslapis – to paties stiliaus kaip saldainių puokščių.
export function AdventLanding({ content, articles }: Props) {
  const items = adventProducts();
  const from = items.length ? Math.min(...items.map((p) => p.priceCents)) : 0;
  const bySlug = (slug: string) => items.find((p) => p.slug === slug);
  const groups = ADVENT_GROUPS.map((group) => ({
    ...group,
    items: items.filter((p) => p.recipients.includes(group.id)),
  })).filter((group) => group.items.length > 0);
  // Hero „vėduoklė“: kairėje – jam, dešinėje – vaikams, centre – jai.
  const fan = [
    bySlug("advento-kalendorius-kavos-kelione"),
    bySlug("advento-kalendorius-princeses-skrynele"),
    bySlug("advento-kalendorius-jaukumo-vakarai"),
  ].filter((p) => p !== undefined);
  const faq = content?.faq ?? [];

  return (
    <>
      <div className="adv-dark">
        <section className="bq-hero lp-advent" aria-labelledby="adv-title">
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
            <div>
              <nav
                aria-label="Naršymo takelis"
                className="mb-6 flex items-center gap-1 text-[13px] text-cream-100/70"
              >
                <Link href="/" className="hover:text-gold-300">
                  Pradžia
                </Link>
                <ChevronRight className="size-3.5" aria-hidden />
                <span className="font-medium text-cream-50">
                  Advento kalendoriai
                </span>
              </nav>
              <p className="bq-eyebrow">
                <span className="bq-eyebrow-tag">Nauja</span>
                Advento kalendoriai 2026
              </p>
              <h1 id="adv-title" className="bq-title font-display">
                Advento kalendoriai jai, jam ir vaikams –{" "}
                <em>24 staigmenos iki Kalėdų</em>
              </h1>
              <p className="mt-5 max-w-lg text-[15.5px] font-medium leading-relaxed text-cream-100/85 sm:text-[17px]">
                Kiekvieną gruodžio rytą – naujas langelis ir nauja staigmena.
                Visi kalendoriai užpildyti ir paruošti dovanoti: išsirink pagal
                tai, kuo žmogus gyvena.
              </p>
              <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
                <ButtonLink
                  href="#kalendoriai"
                  size="lg"
                  className="adv-cta hero-cta w-full sm:w-auto"
                >
                  Rinktis kalendorių
                </ButtonLink>
                {items.length ? (
                  <p className="text-center text-[15px] font-semibold text-cream-50 sm:text-left">
                    {items.length} {calendarWord(items.length)} · nuo{" "}
                    <span className="text-gold-300">{formatPrice(from)}</span>
                  </p>
                ) : null}
              </div>
              <ul
                className="bq-perks"
                aria-label="Advento kalendorių privalumai"
              >
                <li>
                  <CalendarDays
                    aria-hidden
                    className="size-4"
                    strokeWidth={1.9}
                  />
                  24 langeliai iki Kalėdų
                </li>
                <li>
                  <Gift aria-hidden className="size-4" strokeWidth={1.9} />
                  Užpildyti ir paruošti dovanoti
                </li>
                <li>
                  <Truck aria-hidden className="size-4" strokeWidth={1.9} />
                  Nemokamas pristatymas nuo {free}
                </li>
              </ul>
            </div>

            {fan.length === 3 ? (
              <div className="bq-fan" aria-hidden>
                {fan.map((product, i) => (
                  <div key={product.slug} className={`bq-fan-card bq-fan-${i}`}>
                    <ProductImage
                      fill
                      images={[lifestyleImage(product)]}
                      seed={product.artSeed}
                      alt=""
                      size="hero"
                      priority={i === 2}
                      sizes="(min-width: 1024px) 22rem, 60vw"
                      className="object-cover"
                    />
                  </div>
                ))}
                <span className="bq-fan-badge">
                  <span className="bq-fan-badge-price">
                    nuo {formatPrice(from)}
                  </span>
                  <span className="bq-fan-badge-text">24 staigmenos</span>
                </span>
              </div>
            ) : null}
          </div>
        </section>

        <section
          id="kalendoriai"
          aria-labelledby="adv-pick"
          className="lp-advent scroll-mt-28 pb-16 lg:pb-24"
        >
          <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
            <h2
              id="adv-pick"
              className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-cream-50 sm:text-[2.6rem]"
            >
              Kam ieškote <em>kalendoriaus?</em>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-cream-100/80 sm:text-base">
              Kalendoriai jai, jam ir vaikams – pasirinkite ir pereikite tiesiai
              prie tinkamų.
            </p>
            <ul
              className="bq-moods adv-groups"
              aria-label="Kalendoriai pagal gavėją"
            >
              {groups.map((group) => {
                const cover = bySlug(group.cover) ?? group.items[0];
                const groupFrom = Math.min(
                  ...group.items.map((p) => p.priceCents),
                );
                return (
                  <li key={group.id}>
                    <a href={`#${group.id}`} className="bq-mood">
                      <span aria-hidden className="bq-mood-dot adv-group-photo">
                        <ProductImage
                          fill
                          images={[lifestyleImage(cover)]}
                          seed={cover.artSeed}
                          alt=""
                          size="thumb"
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="bq-mood-copy">
                        <span className="bq-mood-name">{group.title}</span>
                        <span className="adv-group-sub">
                          {group.items.length}{" "}
                          {calendarWord(group.items.length)} · nuo{" "}
                          {formatPrice(groupFrom)}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {groups.map((group) => {
              const cover = bySlug(group.cover) ?? group.items[0];
              const groupFrom = Math.min(
                ...group.items.map((p) => p.priceCents),
              );
              return (
                <div
                  key={group.id}
                  id={group.id}
                  className="adv-group scroll-mt-28"
                >
                  <div className="adv-group-head">
                    <h3 className="font-display text-[1.6rem] font-bold leading-tight text-cream-50 sm:text-[2rem]">
                      {group.title}
                    </h3>
                    <p className="max-w-xl text-[14.5px] font-medium leading-relaxed text-cream-100/80 lg:hidden">
                      {group.text}
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
                    <div
                      className={`bq-feature adv-feature ${group.items.length > 3 ? "adv-feature-tall" : ""}`}
                    >
                      <span className="bq-feature-media">
                        <ProductImage
                          fill
                          images={[lifestyleImage(cover)]}
                          seed={cover.artSeed}
                          alt=""
                          size="hero"
                          sizes="19rem"
                          className="object-cover"
                        />
                      </span>
                      <span className="bq-feature-body">
                        <span className="bq-feature-kicker">
                          {group.items.length}{" "}
                          {calendarWord(group.items.length)}
                        </span>
                        <span className="bq-feature-title">{group.title}</span>
                        <span className="bq-feature-text">{group.text}</span>
                        <span className="adv-feature-price">
                          nuo {formatPrice(groupFrom)}
                        </span>
                      </span>
                    </div>
                    {group.items.map((product) => (
                      <div
                        key={product.slug}
                        id={product.slug}
                        className="advent-card scroll-mt-28"
                      >
                        <ProductCard product={contentsFirst(product)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section aria-labelledby="adv-how" className="bq-how adv-how">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2
            id="adv-how"
            className="home-h2 font-display text-[2rem] font-bold leading-[1.06] sm:text-[2.6rem]"
          >
            Kaip tai <em>veikia</em>
          </h2>
          <ol className="bq-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bq-step">
                <span className="bq-step-num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <step.icon
                  aria-hidden
                  className="bq-step-icon"
                  strokeWidth={1.6}
                />
                <h3 className="bq-step-title font-display">{step.title}</h3>
                <p className="bq-step-text">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="bq-note">
            <ShieldCheck
              aria-hidden
              className="size-4.5 shrink-0"
              strokeWidth={1.9}
            />
            Vaikiškuose kalendoriuose nurodytas rekomenduojamas amžius – su
            smulkiomis detalėmis mažiesiems žaisti prižiūrint suaugusiajam.
          </p>
        </div>
      </section>

      {content ? (
        <section
          aria-labelledby="gidas"
          className="mx-auto max-w-3xl px-4 pb-4 pt-12 sm:px-6 lg:pt-16"
        >
          <h2
            id="gidas"
            className="font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]"
          >
            {content.guide.heading}
          </h2>
          <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-ink-600">
            {content.guide.paragraphs.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length > 0 ? (
        <section
          aria-labelledby="kolekcijos-gidai"
          className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8"
        >
          <h2
            id="kolekcijos-gidai"
            className="home-h2 mb-7 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]"
          >
            Patarimai <em>ir idėjos</em>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {faq.length ? (
        <section
          aria-labelledby="kolekcijos-duk"
          className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14"
        >
          <h2
            id="kolekcijos-duk"
            className="mb-5 font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]"
          >
            Dažni klausimai
          </h2>
          <FAQAccordion items={faq} showContact={false} />
        </section>
      ) : null}

      <TrustStrip />

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanos", href: "/dovanos/visos-dovanos" },
            { name: "Advento kalendoriai", href: ADVENT_HREF },
          ]),
          ...(faq.length ? [faqSchema(faq)] : []),
        ]}
      />
    </>
  );
}
