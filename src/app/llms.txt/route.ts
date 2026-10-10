import { store } from "@/lib/config/store.config";
import { products } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-static";

// llms.txt (https://llmstxt.org): trumpas parduotuvės aprašas AI paieškos sistemoms.
export function GET() {
  const base = store.brand.url.replace(/\/$/, "");
  const freeFrom = `${store.shipping.freeThresholdCents / 100} €`;

  const body = `# ${store.brand.name}

> Lietuviška internetinė kalėdinių dovanų parduotuvė: kruopščiai parinktos dovanos jai, jam, šeimai ir porai. Pristatymas visoje Lietuvoje per ${store.shipping.estimate}, ${formatPrice(store.shipping.flatRateCents)} arba nemokamai nuo ${freeFrom}. Atsiskaitymas kortele, Apple Pay ir Google Pay.

## Kolekcijos

${collections.map((c) => `- [${c.title}](${base}/dovanos/${c.slug}): ${c.description}`).join("\n")}

## Prekės

${products
  .filter((p) => p.inStock)
  .map((p) => `- [${p.name}](${base}/produktai/${p.slug}) — ${formatPrice(p.priceCents)}: ${p.tagline}`)
  .join("\n")}

## Pagalba

- [Dovanų paieška pagal gavėją ir biudžetą](${base}/rask-dovana)
- [Pristatymas](${base}/pristatymas)
- [DUK](${base}/duk)
- [Pirkimo taisyklės](${base}/pirkimo-taisykles)
- [Kontaktai](${base}/kontaktai): ${store.contact.email}

## Optional

- [Apie mus](${base}/apie-mus)
- [Straipsniai ir dovanų idėjos](${base}/straipsniai)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
