import type { MetadataRoute } from "next";
import { store } from "@/lib/config/store.config";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/dekojame", "/checkout", "/apmokejimas", "/tiktok", "/instagram", "/krepselis"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // AI paieškos ir atsakymų robotai – aiškiai leidžiami, kad parduotuvę galėtų cituoti.
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-SearchBot",
          "Claude-User",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${store.brand.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
