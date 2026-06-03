import type { MetadataRoute } from "next";
import { JOURNAL } from "@/lib/journal";

const SITE = "https://krain.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const posts: MetadataRoute.Sitemap = JOURNAL.map((entry) => ({
    url: `${SITE}/journal/${entry.slug}`,
    lastModified: new Date(entry.dateISO),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
