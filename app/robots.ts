import type { MetadataRoute } from "next";

import { getSiteUrl, isPreviewDeployment } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (isPreviewDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      host: siteUrl,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/book", "/book/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
