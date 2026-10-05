"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Snowfall = dynamic(
  () => import("@/components/layout/snowfall").then((m) => ({ default: m.Snowfall })),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import("@/components/commerce/cart-drawer").then((m) => ({ default: m.CartDrawer })),
  { ssr: false }
);
const SocialProofToast = dynamic(
  () =>
    import("@/components/commerce/social-proof-toast").then((m) => ({
      default: m.SocialProofToast,
    })),
  { ssr: false }
);
const SmartPopups = dynamic(
  () => import("@/components/commerce/smart-popups").then((m) => ({ default: m.SmartPopups })),
  { ssr: false }
);
const CookieBanner = dynamic(
  () => import("@/components/layout/cookie-banner").then((m) => ({ default: m.CookieBanner })),
  { ssr: false }
);
const TabTitleFlash = dynamic(
  () => import("@/components/layout/tab-title-flash").then((m) => ({ default: m.TabTitleFlash })),
  { ssr: false }
);

// Antriniai elementai prijungiami naršyklei atsilaisvinus, kad neužimtų
// pagrindinės gijos hidratacijos ir LCP metu.
export function DeferredChrome() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const go = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(go, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(go, 600);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <>
      <Snowfall />
      <CartDrawer />
      <SocialProofToast />
      <SmartPopups />
      <CookieBanner />
      <TabTitleFlash />
    </>
  );
}
