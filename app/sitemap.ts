import type { MetadataRoute } from "next";

import { getSitemapPages } from "@/lib/content/queries";
import { getSiteUrl, pagePaths } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const dates = await getSitemapPages();

  const priorities: Record<keyof typeof pagePaths, number> = {
    home: 1,
    about: 0.7,
    services: 0.9,
    contact: 0.7,
    privacy: 0.2,
  };

  return (Object.keys(pagePaths) as Array<keyof typeof pagePaths>)
    .filter((slug) => Boolean(dates[slug]))
    .map((slug) => ({
      url: `${siteUrl}${pagePaths[slug]}`,
      lastModified: dates[slug],
      changeFrequency: slug === "services" ? "weekly" : "monthly",
      priority: priorities[slug],
    }));
}
