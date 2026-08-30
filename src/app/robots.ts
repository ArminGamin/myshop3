import type { MetadataRoute } from "next";
import { store } from "@/lib/config/store.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dekojame", "/tiktok", "/instagram", "/krepselis"],
      },
    ],
    sitemap: `${store.brand.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
