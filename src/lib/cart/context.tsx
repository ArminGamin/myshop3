"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cartStore } from "./store";

export { resolveItems, subtotalOf, countOf } from "./store";

interface CartContextValue {
  lines: ReturnType<typeof cartStore.get>;
  hydrated: boolean;
  drawerOpen: boolean;
  checkoutOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addItem: (slug: string, variantId: string, qty?: number, opts?: { silent?: boolean }) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
  removeItem: (slug: string, variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY: ReturnType<typeof cartStore.get> = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.get, () => EMPTY);
  const hydrated = useSyncExternalStore(cartStore.subscribe, cartStore.hydrated, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    cartStore.init();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      hydrated,
      drawerOpen,
      checkoutOpen,
      openDrawer: () => {
        setCheckoutOpen(false);
        setDrawerOpen(true);
      },
      closeDrawer: () => setDrawerOpen(false),
      openCheckout: () => {
        setDrawerOpen(false);
        setCheckoutOpen(true);
      },
      closeCheckout: () => setCheckoutOpen(false),
      addItem: (slug, variantId, qty = 1, opts) => {
        cartStore.add({ slug, variantId, qty }, opts);
        if (!opts?.silent && !checkoutOpen) setDrawerOpen(true);
      },
      setQty: (slug, variantId, qty) => cartStore.setQty(slug, variantId, qty),
      removeItem: (slug, variantId) => cartStore.remove(slug, variantId),
      clearCart: () => cartStore.clear(),
    }),
    [lines, hydrated, drawerOpen, checkoutOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart turi būti naudojamas CartProvider viduje");
  return ctx;
}
