import Link from "next/link";
import { BadgeCheck, Blocks, ChevronRight, Gift, PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { CSSProperties } from "react";
import { store } from "@/lib/config/store.config";
import { products } from "@/lib/data/products";
import { productRank } from "@/lib/data/product-order";
import { formatPrice } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import type { getArticles } from "@/lib/articles";
import type { Product } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-art";
import { FAQAccordion } from "@/components/commerce/faq-accordion";
import { TrustStrip } from "@/components/commerce/trust-strip";
import { ArticleCard } from "@/components/blog/article-card";
import { JsonLd } from "@/components/seo/json-ld";

const LEGO_HREF = "/dovanos/lego-rinkiniai";
const free = formatPrice(store.shipping.freeThresholdCents);

// Kiekvieno rinkinio spalva – „Išsirink rinkinį“ juostelei.
const SWATCH: Record<string, string> = {
  "lego-meduoliu-namelis-10267": "linear-gradient(135deg, #e3b07a, #8a4f1c)",
  "lego-disney-stitch-43249": "linear-gradient(135deg, #7fc4f2, #1f5fae)",
  "lego-kaledu-senelio-roges-40499": "linear-gradient(135deg, #f0646b, #a11320)",
  "lego-ferrari-812-superfast-76914": "linear-gradient(135deg, #ff5a4f, #8f0e14)",
};

const STEPS = [
  {
    icon: BadgeCheck,
    title: "Tik originalūs rinkiniai",
    text: "Visi rinkiniai nauji, neatidaryti, originaliose LEGO® pakuotėse – su visomis detalėmis ir instrukcija.",
  },
  {
    icon: Blocks,
    title: "Statymas, kuris užtrunka",
    text: "Nuo kelių šimtų iki beveik pusantro tūkstančio detalių – užsiėmimas ne vienam žiemos vakarui.",
  },
  {
    icon: Sparkles,
    title: "Puošmena po surinkimo",
    text: "Surinktos rogės ar meduolių namelis tampa šventine dekoracija, o Stitch ir Ferrari – lentynos pažiba.",
  },
];

const FAQ = [
  {
    q: "Ar rinkiniai originalūs?",
    a: "Taip. Visi rinkiniai yra originalūs LEGO® gaminiai – nauji, neatidaryti, gamintojo pakuotėse su instrukcija.",
  },
  {
    q: "Kokio amžiaus vaikams tinka?",
    a: "Rekomenduojamas amžius nurodytas kiekvieno rinkinio aprašyme ir ant dėžutės. Rinkiniuose yra smulkių dalių, todėl jie netinka vaikams iki 3 metų.",
  },
  {
    q: "Per kiek laiko pristatote?",
    a: `Pristatome per 3–4 dienas visoje Lietuvoje. Užsakymams nuo ${free} pristatymas nemokamas.`,
  },
  {
    q: "Ar galima grąžinti rinkinį?",
    a: "Taip, per 14 dienų, jei dėžutė neatidaryta ir nepažeista. Pažeistą siuntą pakeisime arba grąžinsime pinigus.",
  },
];

// Trumpi pavadinimai juostelei, kad telefone tilptų į dvi eilutes.
const SHORT: Record<string, string> = {
  "lego-meduoliu-namelis-10267": "Meduolių namelis",
  "lego-disney-stitch-43249": "Disney Stitch",
  "lego-kaledu-senelio-roges-40499": "Senelio rogės",
  "lego-ferrari-812-superfast-76914": "Ferrari 812",
};
const shortName = (p: Product) => SHORT[p.slug] ?? p.name.replace(/^LEGO®\s*/, "");
const pieces = (p: Product) => p.specs?.find((s) => s.label === "Detalių skaičius")?.value;

type Props = { articles: ReturnType<typeof getArticles> };

export function LegoLanding({ articles }: Props) {
  const items = products
    .filter((p) => p.inStock && p.slug.startsWith("lego-"))
    .sort((a, b) => productRank(a.slug) - productRank(b.slug));
  const from = items.length ? Math.min(...items.map((p) => p.priceCents)) : 0;
  const bySlug = (slug: string) => items.find((p) => p.slug === slug);
  // Hero „vėduoklė“: centre – Kalėdų Senelio rogės, šonuose – Stitch ir meduolių namelis.
  const fan = [
    bySlug("lego-disney-stitch-43249"),
    bySlug("lego-meduoliu-namelis-10267"),
    bySlug("lego-kaledu-senelio-roges-40499"),
  ].filter((p) => p !== undefined);

  return (
    <>
      <section className="bq-hero lp-lego" aria-labelledby="lego-title">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
          <div>
            <nav aria-label="Naršymo takelis" className="mb-6 flex items-center gap-1 text-[13px] text-ink-400">
              <Link href="/" className="hover:text-burgundy-600">Pradžia</Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span className="font-medium text-ink-600">LEGO rinkiniai</span>
            </nav>
            <p className="bq-eyebrow">
              <span className="bq-eyebrow-tag">Nauja</span>
              Originalūs rinkiniai
            </p>
            <h1 id="lego-title" className="bq-title font-display">
              LEGO® rinkiniai, kuriuos <em>norisi statyti per šventes</em>
            </h1>
            <p className="mt-5 max-w-lg text-[15.5px] font-medium leading-relaxed text-ink-600 sm:text-[17px]">
              Dovana, kuri neatsibosta po pirmos valandos: nuo šventinių rogių ir meduolių namelio iki Stitch ir Ferrari.
              Visi rinkiniai nauji, originaliose gamintojo pakuotėse ir paruošti dovanoti.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink href="#rinkiniai" size="lg" className="w-full sm:w-auto">
                Rinktis rinkinį
              </ButtonLink>
              {items.length ? (
                <p className="text-center text-[15px] font-semibold text-ink-900 sm:text-left">
                  {items.length} rinkiniai · nuo <span className="text-burgundy-600">{formatPrice(from)}</span>
                </p>
              ) : null}
            </div>
            <ul className="bq-perks" aria-label="LEGO rinkinių privalumai">
              <li>
                <PackageCheck aria-hidden className="size-4" strokeWidth={1.9} />
                Nauji, gamintojo pakuotėse
              </li>
              <li>
                <Gift aria-hidden className="size-4" strokeWidth={1.9} />
                Paruošta dovanoti
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
                <span className="bq-fan-badge-text">originalūs LEGO®</span>
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section id="rinkiniai" aria-labelledby="lego-pick" className="lp-lego scroll-mt-28">
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <h2 id="lego-pick" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.6rem]">
            Išsirink <em>rinkinį</em>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-ink-600 sm:text-base">
            Šventinis, mėgstamas personažas ar greitas automobilis – kiekvienam vaikui savas.
          </p>
          <ul className="bq-moods" aria-label="LEGO rinkiniai">
            {items.map((product) => (
              <li key={product.slug}>
                <a href={`#${product.slug}`} className="bq-mood">
                  <span
                    aria-hidden
                    className="bq-mood-dot"
                    style={{ "--swatch": SWATCH[product.slug] ?? "linear-gradient(135deg, #e0a93b, #8f5208)" } as CSSProperties}
                  />
                  <span className="bq-mood-copy">
                    <span className="bq-mood-name">{shortName(product)}</span>
                    <span className="bq-mood-sub">
                      <span className="sm:hidden">{formatPrice(product.priceCents)}</span>
                      <span className="hidden sm:inline">{pieces(product) ? `${pieces(product)} detalės` : "Originalus rinkinys"}</span>
                    </span>
                  </span>
                  <span className="bq-mood-price">{formatPrice(product.priceCents)}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
            {items.map((product) => (
              <div key={product.slug} id={product.slug} className="scroll-mt-28">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="lego-how" className="bq-how lego-how mt-16 lg:mt-24">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2 id="lego-how" className="home-h2 font-display text-[2rem] font-bold leading-[1.06] sm:text-[2.6rem]">
            Kodėl LEGO® – <em>gera dovana</em>
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
            Rinkiniuose yra smulkių dalių – netinka vaikams iki 3 metų.
          </p>
        </div>
      </section>

      {articles.length > 0 ? (
        <section aria-labelledby="kolekcijos-gidai" className="lp-lego mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <h2 id="kolekcijos-gidai" className="home-h2 mb-7 font-display text-[2rem] font-bold leading-[1.06] text-ink-900 sm:text-[2.5rem]">
            Patarimai <em>ir idėjos</em>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="lego-faq" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <h2 id="lego-faq" className="mb-5 font-display text-[1.7rem] font-bold leading-tight text-ink-900 sm:text-[2.2rem]">
          Dažni klausimai
        </h2>
        <FAQAccordion items={FAQ} showContact={false} />
      </section>

      <TrustStrip />

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Pradžia", href: "/" },
            { name: "Dovanos", href: "/dovanos/visos-dovanos" },
            { name: "LEGO rinkiniai", href: LEGO_HREF },
          ]),
          faqSchema(FAQ),
        ]}
      />
    </>
  );
}
