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
import { useRouter } from "next/navigation";
import { cartStore } from "./store";
import { CHECKOUT_ENTRY_KEY } from "@/lib/checkout/analytics-keys";

export { resolveItems, subtotalOf, countOf } from "./store";

interface CartContextValue {
  lines: ReturnType<typeof cartStore.get>;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCheckout: () => void;
  addItem: (slug: string, variantId: string, qty?: number, opts?: { silent?: boolean }) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
  removeItem: (slug: string, variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY: ReturnType<typeof cartStore.get> = [];

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.get, () => EMPTY);
  const hydrated = useSyncExternalStore(cartStore.subscribe, cartStore.hydrated, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    cartStore.init();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      hydrated,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      openCheckout: () => {
        setDrawerOpen(false);
        try {
          sessionStorage.setItem(CHECKOUT_ENTRY_KEY, String(Date.now()));
        } catch {
          /* neprieinama */
        }
        router.push("/checkout");
      },
      addItem: (slug, variantId, qty = 1, opts) => {
        cartStore.add({ slug, variantId, qty }, opts);
        if (!opts?.silent) setDrawerOpen(true);
      },
      setQty: (slug, variantId, qty) => cartStore.setQty(slug, variantId, qty),
      removeItem: (slug, variantId) => cartStore.remove(slug, variantId),
      clearCart: () => cartStore.clear(),
    }),
    [lines, hydrated, drawerOpen, router]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart turi būti naudojamas CartProvider viduje");
  return ctx;
}
