import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { collections } from "@/lib/data/collections";
import { products } from "@/lib/data/products";
import { SectionGlyph } from "@/components/ui/line-icons";

type TileSize = "tall" | "small" | "wide";

// `image` leidžia rankiniu būdu parinkti nuotrauką; kitaip imamas bestseleris.
const TILES: { slug: string; size: TileSize; image?: string }[] = [
  { slug: "dovanos-jai", size: "tall", image: "/products/zvakide-sventinis-vakaras-q2-98b41e146c.webp" },
  { slug: "dovanos-jam", size: "tall" },
  {
    slug: "dovanos-seimai",
    size: "small",
    image: "/products/seimos-megztiniai-siaures-rastas-family-real-v2-47dd02e0.webp",
  },
  { slug: "dovanos-poroms", size: "small" },
  { slug: "dovanos-iki-20-euru", size: "small" },
  { slug: "dovanos-iki-50-euru", size: "small" },
  { slug: "premium-dovanos", size: "wide" },
];

const PREFERRED: Record<string, string> = {
  "dovanos-jam": "viskio-akmenu-ir-stiklo-rinkinys",
  "dovanos-poroms": "poros-knyga-musu-istorija",
  "premium-dovanos": "silkinis-miego-rinkinys-miegas",
};

function giftWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "dovana";
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "dovanos";
  return "dovanų";
}

// Kiekvienai plytelei parenkama skirtinga nuotrauka: pirmiausia bestseleriai.
function buildTiles() {
  const used = new Set<string>(TILES.flatMap((t) => (t.image ? [t.image] : [])));
  return TILES.flatMap((tile) => {
    const collection = collections.find((c) => c.slug === tile.slug);
    if (!collection) return [];
    const matching = products.filter((p) => p.inStock && collection.filter(p));
    const candidates = matching.filter((p) => p.images.length > 0 && !used.has(p.images[0]));
    const cover = tile.image
      ? null
      : (candidates.find((p) => p.slug === PREFERRED[tile.slug]) ??
        [...candidates].sort((a, b) => Number(b.bestseller) - Number(a.bestseller))[0]);
    if (cover) used.add(cover.images[0]);
    return [
      {
        ...tile,
        href: `/dovanos/${collection.slug}`,
        label: tile.size === "small" ? collection.shortTitle : collection.title,
        count: matching.length,
        image: tile.image ?? cover?.images[0] ?? null,
      },
    ];
  });
}

export function RecipientBento() {
  const tiles = buildTiles();

  return (
    <ul className="home-bento mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.slug} className="home-bento-cell" data-size={tile.size}>
          <Link href={tile.href} className="home-tile group" data-size={tile.size}>
            {tile.image ? (
              <Image
                src={tile.image}
                alt=""
                fill
                quality={75}
                sizes={
                  tile.size === "wide"
                    ? "(min-width: 1024px) 40rem, 100vw"
                    : "(min-width: 1024px) 20rem, 50vw"
                }
                className="home-tile-img object-cover"
              />
            ) : null}
            <span aria-hidden className="home-tile-scrim" />
            <span className="home-tile-body">
              <span className="home-tile-label font-display font-bold text-cream-50">{tile.label}</span>
              <span className="text-[12px] font-semibold text-cream-100/85 sm:text-[13px]">
                {tile.count} {giftWord(tile.count)}
              </span>
            </span>
            <span aria-hidden className="home-tile-go">
              <ArrowUpRight className="size-4" strokeWidth={2} />
            </span>
          </Link>
        </li>
      ))}
      <li id="dovanu-radiklis" className="home-bento-cell scroll-mt-32" data-size="wide">
        <Link href="/rask-dovana" className="home-finder group">
          <span aria-hidden className="home-finder-icon">
            <SectionGlyph name="search" className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[1.6rem] font-bold leading-tight text-cream-50 sm:text-[2rem]">
              Nežinote, ką rinktis?
            </span>
            <span className="mt-1 block text-[13.5px] font-medium leading-snug text-cream-100/85 sm:text-[15px]">
              Atsakykite į 4 klausimus ir padėsime išsirinkti.
            </span>
          </span>
          <span className="home-finder-cta">
            Rasti mano dovaną
            <ArrowUpRight className="size-4" strokeWidth={2.2} />
          </span>
        </Link>
      </li>
    </ul>
  );
}
