"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { Product } from "@/types";

export function TrackProductView({ product }: { product: Product }) {
  useEffect(() => {
    track("view_item", {
      item_id: product.slug,
      item_name: product.name,
      value: product.priceCents / 100,
    });
    // Įrašome į „neseniai peržiūrėtas"
    import("@/lib/behavior/storage").then(({ pushRecentlyViewed }) =>
      pushRecentlyViewed(product.slug)
    );
  }, [product]);
  return null;
}
