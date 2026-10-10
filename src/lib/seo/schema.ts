import { store } from "@/lib/config/store.config";
import type { Product } from "@/types";
import { flags } from "@/lib/config/store.config";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.brand.name,
    url: store.brand.url,
    logo: `${store.brand.url}/logo.png`,
    email: store.contact.email,
    sameAs: [store.social.instagram, store.social.facebook, store.social.tiktok],
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: store.brand.name,
    url: store.brand.url,
    inLanguage: "lt-LT",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${store.brand.url}/paieska?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// AggregateRating įtraukiamas, kai ENABLE_REVIEWS ir prekė turi rating/reviewCount.
export function productSchema(product: Product): JsonLd {
  const ld: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    image: product.images.map((src) => `${store.brand.url}${src}`),
    sku: product.sku,
    brand: { "@type": "Brand", name: store.brand.name },
    offers: {
      "@type": "Offer",
      url: `${store.brand.url}/produktai/${product.slug}`,
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (store.shipping.flatRateCents / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "LT" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 4, maxValue: 5, unitCode: "DAY" },
        },
      },
    },
  };
  if (flags.ENABLE_REVIEWS && product.rating && product.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }
  return ld;
}

export function breadcrumbSchema(items: { name: string; href: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${store.brand.url}${item.href}`,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
