import type { Metadata } from "next";

import type {
  PageSeo,
  PageSlug,
  SiteSettings,
} from "@/lib/content/schemas";
import { absoluteUrl } from "@/lib/utils";

const FALLBACK_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const withProtocol = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
      withProtocol,
    );
    // Never publish localhost URLs in a production build.
    if (!(process.env.NODE_ENV === "production" && localhost)) {
      return withProtocol.replace(/\/$/, "");
    }
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return FALLBACK_URL;
}

export function isPreviewDeployment() {
  return Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
}

export const pagePaths: Record<PageSlug, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  contact: "/contact",
  privacy: "/privacy",
};

export function buildPageMetadata(
  slug: PageSlug,
  seo: PageSeo,
  settings: SiteSettings,
): Metadata {
  const siteUrl = getSiteUrl();
  const path = pagePaths[slug];
  const canonical = seo.canonical.trim() || path;
  const image = seo.ogImage ?? settings.seo.defaultOgImage;
  const imageUrl = image ? absoluteUrl(image.src, siteUrl) : undefined;
  const noindex = seo.noindex || isPreviewDeployment();

  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_AU",
      siteName: settings.brand.name,
      title: seo.title,
      description: seo.description,
      url: absoluteUrl(path, siteUrl),
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: image?.width ?? 1200,
              height: image?.height ?? 630,
              alt: image?.alt ?? settings.brand.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    verification: {
      google: settings.seo.googleVerification || undefined,
      other: settings.seo.bingVerification
        ? { "msvalidate.01": settings.seo.bingVerification }
        : undefined,
    },
  };
}

export function rootMetadata(settings: SiteSettings): Metadata {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    applicationName: settings.brand.name,
    title: {
      default: settings.seo.defaultTitle,
      template: `%s | ${settings.brand.name}`,
    },
    description: settings.seo.defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_AU",
      siteName: settings.brand.name,
      title: settings.seo.defaultTitle,
      description: settings.seo.defaultDescription,
      url: siteUrl,
      images: settings.seo.defaultOgImage
        ? [
            {
              url: absoluteUrl(settings.seo.defaultOgImage.src, siteUrl),
              width: settings.seo.defaultOgImage.width ?? 1200,
              height: settings.seo.defaultOgImage.height ?? 630,
              alt: settings.seo.defaultOgImage.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.defaultTitle,
      description: settings.seo.defaultDescription,
      images: settings.seo.defaultOgImage
        ? [absoluteUrl(settings.seo.defaultOgImage.src, siteUrl)]
        : undefined,
    },
    robots: isPreviewDeployment()
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    verification: {
      google: settings.seo.googleVerification || undefined,
      other: settings.seo.bingVerification
        ? { "msvalidate.01": settings.seo.bingVerification }
        : undefined,
    },
  };
}
