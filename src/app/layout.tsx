import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { store } from "@/lib/config/store.config";
import { CartProvider } from "@/lib/cart/context";
import { ConsentProvider } from "@/lib/consent";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { IntroCutscene } from "@/components/layout/intro-cutscene";
import { Snowfall } from "@/components/layout/snowfall";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { SmartPopups } from "@/components/commerce/smart-popups";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

const display = Cormorant_Garamond({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(store.brand.url),
  title: {
    default: `${store.brand.name} — Kalėdinės dovanos internetu | Pristatymas visoje Lietuvoje`,
    template: `%s | ${store.brand.name}`,
  },
  description:
    "Kruopščiai parinktos kalėdinės dovanos jai, jam, šeimai ir porai. Nemokamas pristatymas nuo 80 €, pristatymas per 4–6 dienas, grąžinimas per 14 dienų.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "lt_LT",
    siteName: store.brand.name,
    title: `${store.brand.name} — ${store.brand.tagline}`,
    description: "Kalėdinės dovanos, kurias iš tikrųjų norisi dovanoti.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2A1F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt" className={`${display.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="relative z-0 flex min-h-dvh flex-col">
        <Script id="intro-gate" strategy="beforeInteractive">
          {`try{if(!sessionStorage.getItem("kaledukampelis.intro.v1")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="pending"}}catch(e){}`}
        </Script>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(), websiteSchema()]),
          }}
        />
        <ConsentProvider>
          <CartProvider>
            <Snowfall />
            <IntroCutscene />
            <a
              href="#turinys"
              className="cta-fill sr-only z-[100] rounded-[12px] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
            >
              Prie turinio
            </a>
            <div className="sticky top-0 z-50">
              <AnnouncementBar />
              <Header />
            </div>
            <main id="turinys" className="relative z-[2] bg-transparent">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <SmartPopups />
            <CookieBanner />
          </CartProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
