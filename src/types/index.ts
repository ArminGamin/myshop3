export type RecipientId =
  | "jai"
  | "jam"
  | "porai"
  | "seimai"
  | "draugui"
  | "tevams"
  | "kolegai";

export type VibeId =
  | "praktiskas"
  | "romantiskas"
  | "linksmas"
  | "minimalistas"
  | "jaukus"
  | "technologiskas";

export type OccasionId =
  | "kaledos"
  | "slaptas-senelis"
  | "seimos-svente"
  | "draugams"
  | "partneriui";

export type PriceRangeId = "iki-20" | "iki-30" | "iki-50" | "50-plus";

export interface ProductVariant {
  id: string;
  name: string;
  priceDeltaCents?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  description: string[];
  benefits: string[];
  specs: ProductSpec[];
  priceCents: number;
  compareAtPriceCents: number | null;
  variants: ProductVariant[];
  defaultVariantId: string;
  images: string[];
  artSeed: string;
  bestseller: boolean;
  isNew: boolean;
  premium: boolean;
  recipients: RecipientId[];
  vibes: VibeId[];
  occasions: OccasionId[];
  pairsWith: string[];
  inStock: boolean;
  rating: number | null;
  reviewCount: number | null;
}

export const RECIPIENT_LABELS: Record<RecipientId, string> = {
  jai: "Jai",
  jam: "Jam",
  porai: "Porai",
  seimai: "Šeimai",
  draugui: "Draugui",
  tevams: "Tėvams",
  kolegai: "Kolegai",
};

export const VIBE_LABELS: Record<VibeId, string> = {
  praktiskas: "Praktiškas",
  romantiskas: "Romantiškas",
  linksmas: "Linksmas",
  minimalistas: "Minimalistas",
  jaukus: "Mėgstantis jaukumą",
  technologiskas: "Technologijų mėgėjas",
};

export const OCCASION_LABELS: Record<OccasionId, string> = {
  kaledos: "Kalėdos",
  "slaptas-senelis": "Slaptas Kalėdų Senelis",
  "seimos-svente": "Šeimos šventė",
  draugams: "Draugams",
  partneriui: "Partneriui",
};

export function priceRangeOf(priceCents: number): PriceRangeId {
  if (priceCents <= 2000) return "iki-20";
  if (priceCents <= 3000) return "iki-30";
  if (priceCents <= 5000) return "iki-50";
  return "50-plus";
}

export interface CartLine {
  slug: string;
  variantId: string;
  qty: number;
}

export interface CartItemResolved extends CartLine {
  product: Product;
  variant: ProductVariant;
  unitPriceCents: number;
  lineTotalCents: number;
}
