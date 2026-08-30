import { store } from "@/lib/config/store.config";
import { products } from "@/lib/data/products";

export const runtime = "nodejs";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Google Merchant Center / Meta / TikTok katalogų RSS 2.0 feed.
// DEMO duomenys — prieš pateikdami į Merchant Center, naudokite realius.
export async function GET() {
  const base = store.brand.url.replace(/\/$/, "");

  const items = products
    .filter((p) => p.inStock)
    .map((p) => {
      return `    <item>
      <g:id>${esc(p.sku)}</g:id>
      <g:title>${esc(`${p.name} | ${store.brand.name}`)}</g:title>
      <g:description>${esc(p.tagline)}</g:description>
      <g:link>${base}/produktai/${p.slug}</g:link>
      <g:image_link>${base}/api/art?seed=${p.artSeed}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${(p.priceCents / 100).toFixed(2)} EUR</g:price>
      <g:brand>${esc(store.brand.name)}</g:brand>
      <g:google_product_category>Home &amp; Garden &gt; Decor</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${esc(store.brand.name)} — kalėdinės dovanos</title>
    <link>${base}</link>
    <description>Prekių katalogas</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
