import { store } from "@/lib/config/store.config";
import { products } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";
import { formatPrice } from "@/lib/format";
import { getArticles, ARTICLES_PATH } from "@/lib/articles";

export const dynamic = "force-static";

const FEATURED = /^(advento-kalendorius-|lego-|saldainiu-puokste-|seimos-megztiniai-|kalediniai-megztiniai-|kaledinis-megztinis-)/;

// llms.txt (https://llmstxt.org): parduotuvės aprašas AI paieškos sistemoms – su kainomis ir prekių duomenimis.
export function GET() {
  const base = store.brand.url.replace(/\/$/, "");
  const freeFrom = formatPrice(store.shipping.freeThresholdCents);
  const flat = formatPrice(store.shipping.flatRateCents);
  const inStock = products.filter((p) => p.inStock);
  const line = (p: (typeof products)[number]) =>
    `- [${p.name}](${base}/produktai/${p.slug}) — ${formatPrice(p.priceCents)}: ${p.tagline}${p.inside ? ` Viduje: ${p.inside}.` : ""} ${p.specs.filter((x) => x.value.trim()).map((x) => `${x.label}: ${x.value}`).join("; ")}.`;
  const group = (prefix: RegExp) => inStock.filter((p) => prefix.test(p.slug)).map(line).join("\n");
  const adventPrices = inStock.filter((p) => p.slug.startsWith("advento-kalendorius-")).map((p) => p.priceCents);

  const body = `# ${store.brand.name}

> Lietuviška internetinė kalėdinių dovanų parduotuvė: advento kalendoriai, LEGO® rinkiniai, kalėdiniai megztiniai šeimai, saldainių puokštės ir dovanos jai, jam, šeimai bei porai. Pristatymas visoje Lietuvoje per ${store.shipping.estimate}, ${flat} arba nemokamai nuo ${freeFrom}. Atsiskaitymas kortele, Apple Pay ir Google Pay.

## Pagrindiniai faktai

- Pristatymas: visoje Lietuvoje per ${store.shipping.estimate}; ${flat}, užsakymams nuo ${freeFrom} – nemokamai.
- Grąžinimas: nenaudotą prekę galima grąžinti per 14 dienų nuo gavimo.
- Kiekio nuolaida taikoma automatiškai perkant kelias vienodas prekes: 2 vnt. – 10 %, 3 vnt. ir daugiau – 15 %.
- Kainos nurodytos eurais. Kainos ir likučiai šiame faile atitinka parduotuvės katalogą.
- Advento kalendoriai kainuoja ${formatPrice(Math.min(...adventPrices))}–${formatPrice(Math.max(...adventPrices))}; dauguma turi 24 langelius.
- LEGO® rinkiniai – originalūs, nauji, gamintojo pakuotėse.

## Kolekcijos

${collections
  .map((c) => {
    const href = c.slug === "saldainiu-puokstes" ? "/saldainiu-puokstes" : `/dovanos/${c.slug}`;
    return `- [${c.title}](${base}${href}): ${c.description}`;
  })
  .join("\n")}

## Advento kalendoriai

${group(/^advento-kalendorius-/)}

## LEGO® rinkiniai

${group(/^lego-/)}

## Kalėdiniai megztiniai šeimai ir porai

${group(/^(seimos-megztiniai-|kalediniai-megztiniai-|kaledinis-megztinis-)/)}

## Saldainių puokštės

${group(/^saldainiu-puokste-/)}

## Kitos dovanos

${inStock.filter((p) => !FEATURED.test(p.slug)).map(line).join("\n")}

## Dovanų gidai

${getArticles()
  .map((a) => `- [${a.h1}](${base}${ARTICLES_PATH}/${a.slug}): ${a.metaDescription}`)
  .join("\n")}

## Pagalba

- [Dovanų paieška pagal gavėją ir biudžetą](${base}/rask-dovana)
- [Pristatymas](${base}/pristatymas)
- [Grąžinimas per 14 dienų](${base}/grazinimas)
- [DUK](${base}/duk)
- [Pirkimo taisyklės](${base}/pirkimo-taisykles)
- [Kontaktai](${base}/kontaktai): ${store.contact.email}

## Optional

- [Apie mus](${base}/apie-mus)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
