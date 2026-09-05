"use client";

import dynamic from "next/dynamic";

const Snowfall = dynamic(
  () => import("@/components/layout/snowfall").then((m) => ({ default: m.Snowfall })),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import("@/components/commerce/cart-drawer").then((m) => ({ default: m.CartDrawer })),
  { ssr: false }
);
const CheckoutOverlay = dynamic(
  () =>
    import("@/components/commerce/checkout-overlay").then((m) => ({
      default: m.CheckoutOverlay,
    })),
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

export function DeferredChrome() {
  return (
    <>
      <Snowfall />
      <CartDrawer />
      <CheckoutOverlay />
      <SocialProofToast />
      <SmartPopups />
      <CookieBanner />
      <TabTitleFlash />
    </>
  );
}
