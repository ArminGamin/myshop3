import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  outputFileTracingIncludes: {
    "/*": [
      "./emails/kaledu_kampelis_purchase_confirmation.html",
      "./emails/01_po_1_valandos.html",
      "./emails/02_po_24_valandu.html",
      "./emails/03_po_48_valandu.html",
      "./emails/04_po_72_valandu_paskutinis.html",
    ],
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384, 480],
  },
  async redirects() {
    return [
      {
        source: "/produktai/sventinis-dovanu-krepselis",
        destination: "/produktai/namu-kino-projektorius",
        permanent: true,
      },
      {
        source: "/produktai/bluetooth-grotuvas-garsas",
        destination: "/produktai/isoreine-baterija-kelione",
        permanent: true,
      },
      {
        source: "/produktai/aromaterapijos-zvakide-sventinis-vakaras",
        destination: "/produktai/aromaterapijos-zvake-zvakiu-vakaras",
        permanent: true,
      },
      {
        source: "/produktai/smarves-difuzorius-lazdelemis",
        destination: "/produktai/kvapo-difuzorius-lazdelemis",
        permanent: true,
      },
      {
        source: "/produktai/belaidis-ikroviklis-azuolas",
        destination: "/produktai/belaidis-ikroviklis-medis",
        permanent: true,
      },
      {
        source: "/produktai/galaktikos-projektorius-astronautas",
        destination: "/produktai/galaktikos-projektorius-zvaigzdziu-kelione",
        permanent: true,
      },
      {
        source: "/apmokejimas",
        destination: "/checkout",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self';" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/products/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/logo.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/logo-mark.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withWorkflow(nextConfig);
