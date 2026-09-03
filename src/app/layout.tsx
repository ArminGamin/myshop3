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
import { IntroStatic } from "@/components/layout/intro-static";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { SafeDiv } from "@/components/layout/safe-div";
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
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(store.brand.url),
  title: {
    default: `${store.brand.name} — Kalėdinės dovanos internetu | Pristatymas visoje Lietuvoje`,
    template: `%s | ${store.brand.name}`,
  },
  description:
    "Kruopščiai parinktos kalėdinės dovanos jai, jam, šeimai ir porai. Nemokamas pristatymas nuo 80 €, pristatymas per 4–6 dienas, kokybės garantija.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "lt_LT",
    siteName: store.brand.name,
    title: `${store.brand.name} — ${store.brand.tagline}`,
    description: "Kalėdinės dovanos, kurias iš tikrųjų norisi dovanoti!",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2A1F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const stripExtensionAttrs = `(function(){function strip(n){if(n.nodeType!==1)return;n.removeAttribute("bis_skin_checked");n.removeAttribute("bis_register");for(var i=n.attributes.length-1;i>=0;i--){var a=n.attributes[i].name;if(a.indexOf("__processed_")===0)n.removeAttribute(a)}}function walk(n){strip(n);for(var j=0;j<n.childNodes.length;j++)walk(n.childNodes[j])}function run(){walk(document.documentElement)}if(document.documentElement)run();else document.addEventListener("DOMContentLoaded",run);var o=new MutationObserver(function(rs){for(var i=0;i<rs.length;i++){var r=rs[i];if(r.type==="attributes")strip(r.target);else for(var j=0;j<r.addedNodes.length;j++)strip(r.addedNodes[j])}});o.observe(document.documentElement,{subtree:true,childList:true,attributes:true});setTimeout(function(){o.disconnect()},2500)})();`;

const motionBootstrap = `try{function r(){document.documentElement.dataset.motionReady="1";window.dispatchEvent(new Event("motion-ready"))}if(matchMedia("(prefers-reduced-motion: reduce)").matches)r()}catch(e){}`;

const introGate = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="pending"}}catch(e){}`;

const appBootstrap = `${stripExtensionAttrs};${motionBootstrap};${introGate}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lt"
      className={`${display.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative z-0 flex min-h-dvh flex-col" suppressHydrationWarning>
        <Script
          id="app-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: appBootstrap }}
        />
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
            <IntroStatic />
            <IntroCutscene />
            <a
              href="#turinys"
              className="cta-fill sr-only z-[100] rounded-[12px] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
            >
              Prie turinio
            </a>
            <SafeDiv className="sticky top-0 z-50">
              <AnnouncementBar />
              <Header />
            </SafeDiv>
            <main id="turinys" className="relative z-[2] bg-transparent" suppressHydrationWarning>
              <SafeDiv>{children}</SafeDiv>
            </main>
            <Footer />
            <DeferredChrome />
          </CartProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
