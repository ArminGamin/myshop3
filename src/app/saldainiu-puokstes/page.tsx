import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Gift, HandHeart, PackageCheck, Ribbon, ShieldCheck, Truck } from "lucide-react";
import type { CSSProperties } from "react";
import { store } from "@/lib/config/store.config";
import { BOUQUET_HREF, BOUQUET_MOODS, bouquetProducts, bouquetTitle } from "@/lib/data/bouquets";
import { formatPrice } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Saldainių puokštės dovanai",
  description:
    "Rankomis komponuotos saldainių puokštės su Kinder, Milka, Ferrero, Raffaello ir kitais firminiais skanėstais. Išsirink šventišką, dovanai paruoštą saldžią staigmeną.",
  alternates: { canonical: BOUQUET_HREF },
};

const free = formatPrice(store.shipping.freeThresholdCents);

const STEPS = [
  {
    icon: Gift,
    title: "Atrenkame firminius saldumynus",
    text: "Kinder, Milka, Ferrero, Raffaello, Haribo ir kiti mėgstami skanėstai – kiekvienas savo gamintojo pakuotėje.",
  },
  {
    icon: HandHeart,
    title: "Komponuojame rankomis",
    text: "Puokštę sudedame užsakius: skirtingi aukščiai, gipsofilų šakelės ir pilna, apvali forma.",
  },
  {
    icon: Ribbon,
    title: "Įvyniojame ir pristatome",
    text: "Popierius, celofanas ir satino kaspinas – puokštė atkeliauja paruošta įteikti.",
  },
];

const FAQ = [
  {
    q: "Kas yra saldainių puokštėje?",
    a: "Kiekviena puokštė komponuojama iš firminių saldumynų, kurių kiekvienas yra atskiroje gamintojo pakuotėje. Tikslų saldumynų sąrašą rasite kiekvienos puokštės aprašyme, skiltyje „Kas slepiasi viduje“.",
  },
  {
    q: "Per kiek laiko pristatote puokštę?",
    a: `Pristatome per 3–4 dienas visoje Lietuvoje. Užsakymams nuo ${free} pristatymas nemokamas.`,
  },
  {
    q: "Ar nurodote alergenus?",
    a: "Saldumynuose gali būti pieno, glitimo, sojos, žemės riešutų ir kitų riešutų. Tiksli kiekvieno saldumyno sudėtis ir alergenai nurodyti ant jo pakuotės.",
  },
  {
    q: "Kaip laikyti puokštę iki įteikimo?",
    a: "Laikykite vėsioje, sausoje vietoje, atokiau nuo radiatorių ir tiesioginės saulės – taip šokoladas išliks gražus. Tinkamumo vartoti terminai nurodyti ant kiekvieno saldumyno pakuotės.",
  },
];

export default function BouquetsPage() {
  const items = bouquetProducts();
  const from = items.length ? Math.min(...items.map((p) => p.priceCents)) : 0;
  const bySlug = (slug: string) => items.find((p) => p.slug === slug);
  // Hero „vėduoklė“: centre – rožinė, šonuose – violetinė ir auksinė.
  const fan = [
    bySlug("saldainiu-puokste-violetine-svajone"),
    bySlug("saldainiu-puokste-auksine-elegancija"),
    bySlug("saldainiu-puokste-rozine-prabanga"),
  ].filter((p) => p !== undefined);

  return (
    <>
      <section className="bq-hero" aria-labelledby="bq-title">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
          <div>
            <nav aria-label="Naršymo takelis" className="mb-6 flex items-center gap-1 text-[13px] text-ink-400">
              <Link href="/" className="hover:text-burgundy-600">Pradžia</Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="font-medium text-ink-600">Saldainių puokštės</span>
            </nav>
            <p className="bq-eyebrow">
              <span className="bq-eyebrow-tag">Nauja</span>
              Rankų darbo
            </p>
            <h1 id="bq-title" className="bq-title font-display">
              Saldainių puokštės, kurios tampa <em>šventės staigmena</em>
            </h1>
            <p className="mt-5 max-w-lg text-[15.5px] font-medium leading-relaxed text-ink-600 sm:text-[17px]">
              Kai norisi padovanoti daugiau nei saldainių dėžutę, rinkis puokštę, kuri iškart patraukia akį. Kiekviena
              komponuojama iš firminių saldumynų, dailiai apvyniojama ir papuošiama kaspinu – belieka įteikti.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink href="#puokstes" size="lg" className="w-full sm:w-auto">
                Rinktis puokštę
              </ButtonLink>
              {items.length ? (
                <p className="text-center text-[15px] font-semibold text-ink-900 sm:text-left">
                  {items.length} puokštės · nuo <span className="text-burgundy-600">{formatPrice(from)}</span>
                </p>
              ) : null}
            </div>
            <ul className="bq-perks" aria-label="Puokščių privalumai">
              <li>
                <HandHeart aria-hidden className="size-4" strokeWidth={1.9} />
                Komponuojama užsakius
              </li>
              <li>
                <PackageCheck aria-hidden className="size-4" strokeWidth={1.9} />
                Firminiai saldumynai
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
                    images={product.images}
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
                <span className="bq-fan-badge-price">nuo {formatPrice(from)}</span>
                <span className="bq-fan-badge-text">paruošta įteikti</span>
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section id="puokstes" aria-labelledby="bq-pick" className="scroll-mt-28">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <h2 id="bq-pick" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.6rem]">
            Išsirink <em>nuotaiką</em>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-ink-600 sm:text-base">
            Švelniai rožinė, sodriai violetinė, ryškiai raudona, elegantiškai auksinė, spalvinga ar braškiškai romantiška.
          </p>
          <ul className="bq-moods" aria-label="Puokštės pagal spalvą">
            {items.map((product) => {
              const mood = BOUQUET_MOODS[product.slug];
              return (
                <li key={product.slug}>
                  <a href={`#${product.slug}`} className="bq-mood">
                    <span aria-hidden className="bq-mood-dot" style={{ "--swatch": mood?.swatch } as CSSProperties} />
                    <span className="bq-mood-copy">
                      <span className="bq-mood-name">{bouquetTitle(product)}</span>
                      <span className="bq-mood-sub">{mood?.label}</span>
                    </span>
                    <span className="bq-mood-price">{formatPrice(product.priceCents)}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
            {items.map((product) => (
              <div key={product.slug} id={product.slug} className="scroll-mt-28">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="bq-how" className="bq-how mt-16 lg:mt-24">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2 id="bq-how" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] sm:text-[2.6rem]">
            Kaip gimsta <em>puokštė</em>
          </h2>
          <ol className="bq-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bq-step">
                <span className="bq-step-num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <step.icon aria-hidden className="bq-step-icon" strokeWidth={1.6} />
                <h3 className="bq-step-title font-display">{step.title}</h3>
                <p className="bq-step-text">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="bq-note">
            <ShieldCheck aria-hidden className="size-4.5 shrink-0" strokeWidth={1.9} />
            Saldumynuose gali būti pieno, glitimo, sojos ir riešutų – tiksli sudėtis nurodyta ant kiekvienos pakuotės.
          </p>
        </div>
      </section>

      <section aria-labelledby="bq-faq" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <h2 id="bq-faq" className="mb-5 font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]">
          Dažni klausimai
        </h2>
        <FAQAccordion items={FAQ} showContact={false} />
      </section>

      <TrustStrip />

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Saldainių puokštės", href: BOUQUET_HREF },
          ]),
          faqSchema(FAQ),
        ]}
      />
    </>
  );
}
