// Patikrina, ar straipsnių lentelėse nurodytos kainos sutampa su prekių kainomis.
// Paleisti pakeitus kainas: npx tsx scripts/check-article-prices.mts
import fs from "node:fs";
import { products } from "../src/lib/data/products";

const price = new Map(products.map((p) => [p.slug, (p.priceCents / 100).toFixed(2).replace(".", ",") + " €"]));
let stale = 0;
for (const file of fs.readdirSync("content/straipsniai").filter((f) => f.endsWith(".json"))) {
  const article = JSON.parse(fs.readFileSync(`content/straipsniai/${file}`, "utf8"));
  for (const section of article.sections ?? []) {
    for (const row of section.table?.rows ?? []) {
      const links = [...row.join(" ").matchAll(/\/produktai\/([a-z0-9-]+)/g)].map((m) => m[1]);
      const cell = row.find((c: string) => /^\d+,\d\d €$/.test(c));
      if (links.length !== 1 || !cell) continue; // deriniai ir „apie“ kainos tikrinami ranka
      const now = price.get(links[0]);
      if (now !== cell) {
        stale++;
        console.log(`${file}: ${links[0]} lentelėje ${cell}, dabar ${now ?? "prekės nebėra"}`);
      }
    }
  }
}
console.log(stale ? `Pasenusių kainų: ${stale}` : "Visos lentelių kainos sutampa.");
process.exit(stale ? 1 : 0);
