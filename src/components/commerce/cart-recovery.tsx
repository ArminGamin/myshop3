"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cartStore } from "@/lib/cart/store";
import { patchCustomerDraft, updateCheckoutAddons, updateMysterySelection } from "@/lib/checkout/draft-store";
import type { CartAddonSelection } from "@/lib/cart/addons";
import type { CartLine } from "@/types";

export function CartRecovery({ lines, email, addons, mysteryGift }: { lines: CartLine[]; email: string; addons: CartAddonSelection; mysteryGift: boolean }) {
  const router = useRouter();
  useEffect(() => {
    cartStore.init();
    cartStore.clear();
    for (const line of lines) cartStore.add(line, { silent: true });
    patchCustomerDraft("email", email);
    updateCheckoutAddons(addons);
    updateMysterySelection(mysteryGift);
    router.replace("/checkout");
  }, [lines, email, addons, mysteryGift, router]);
  return <div className="mx-auto max-w-6xl px-4 py-16" role="status">Atkuriamas tavo krepšelis…</div>;
}
