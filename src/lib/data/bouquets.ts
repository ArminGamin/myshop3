import type { Product } from "@/types";
import { products } from "@/lib/data/products";
import { productRank } from "@/lib/data/product-order";

export const BOUQUET_HREF = "/saldainiu-puokstes";
export const BOUQUET_PREFIX = "saldainiu-puokste-";

// Kiekvienos puokštės nuotaikos spalva – naudojama „Išsirink nuotaiką“ juostoje.
export const BOUQUET_MOODS: Record<string, { label: string; swatch: string }> = {
  "saldainiu-puokste-rozine-prabanga": { label: "Švelniai rožinė", swatch: "linear-gradient(135deg, #f7c9d2, #e79aab)" },
  "saldainiu-puokste-violetine-svajone": { label: "Sodriai violetinė", swatch: "linear-gradient(135deg, #b99ad8, #6f45a3)" },
  "saldainiu-puokste-raudona-saldumynu-bomba": { label: "Ryškiai raudona", swatch: "linear-gradient(135deg, #e0464f, #8f1420)" },
  "saldainiu-puokste-auksine-elegancija": { label: "Auksinė", swatch: "linear-gradient(135deg, #f2dfb0, #c9a24b)" },
  "saldainiu-puokste-vaivorykstes-sprogimas": {
    label: "Spalvinga",
    swatch: "conic-gradient(from 200deg, #1fb5ad, #f04d8c, #ff9a2e, #ffd23f, #1fb5ad)",
  },
  "saldainiu-puokste-braskiu-romantika": { label: "Braškiškai romantiška", swatch: "linear-gradient(135deg, #e7a2ad, #a8263f)" },
};

export function bouquetProducts(): Product[] {
  return products
    .filter((p) => p.inStock && p.slug.startsWith(BOUQUET_PREFIX))
    .sort((a, b) => productRank(a.slug) - productRank(b.slug));
}

// „Saldainių puokštė „Rožinė prabanga““ → „Rožinė prabanga“
export function bouquetTitle(product: Product): string {
  return product.name.match(/„(.+)“/)?.[1] ?? product.name;
}
