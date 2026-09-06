"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/types";

const ProductVariantContext = createContext<{
  variantId: string;
  setVariantId: (id: string) => void;
} | null>(null);

export function ProductVariantProvider({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  const [variantId, setVariantId] = useState(product.defaultVariantId);
  const value = useMemo(() => ({ variantId, setVariantId }), [variantId]);
  return <ProductVariantContext.Provider value={value}>{children}</ProductVariantContext.Provider>;
}

export function useProductVariant(fallbackId: string) {
  const ctx = useContext(ProductVariantContext);
  const [localId, setLocalId] = useState(fallbackId);
  if (ctx) return ctx;
  return { variantId: localId, setVariantId: setLocalId };
}