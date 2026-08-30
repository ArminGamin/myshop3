import type { MetadataRoute } from "next";
import { store, flags, campaign } from "@/lib/config/store.config";
import { products } from "@/lib/data/products";
import { collections } from "@/lib/data/collections";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = store.brand.url.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...collections.map((c) => ({
      url: `${base}/dovanos/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: c.slug === "bestselleriai" ? 0.9 : 0.8,
    })),
    {
      url: `${base}/rask-dovana`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${base}/duk`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/pristatymas`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/grazinimas`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontaktai`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/apie-mus`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.inStock)
    .map((p) => ({
      url: `${base}/produktai/${p.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: p.bestseller ? 0.9 : 0.7,
    }));

  void flags;
  void campaign;
  return [...staticPages, ...productPages];
}
