import type { PublicService } from "@/lib/content/queries";
import { dayKeys, type DayKey, type SiteSettings } from "@/lib/content/schemas";
import { absoluteUrl } from "@/lib/utils";

import { getSiteUrl, pagePaths } from "./metadata";

const schemaDay: Record<DayKey, string> = {
  sunday: "https://schema.org/Sunday",
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
};

export function salonJsonLd(settings: SiteSettings) {
  const siteUrl = getSiteUrl();
  const openingHours = dayKeys
    .filter((day) => !settings.hours[day].closed)
    .map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaDay[day],
      opens: settings.hours[day].open,
      closes: settings.hours[day].close,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${siteUrl}/#salon`,
    name: settings.brand.name,
    url: siteUrl,
    image: [
      absoluteUrl("/images/salon/hero.webp", siteUrl),
      absoluteUrl(settings.brand.logo.src, siteUrl),
    ],
    telephone: settings.contact.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.addressLine1,
      addressLocality: settings.contact.addressLocality,
      addressRegion: settings.contact.addressRegion,
      postalCode: settings.contact.addressPostcode,
      addressCountry: settings.contact.addressCountry,
    },
    openingHoursSpecification: openingHours,
    sameAs: [settings.contact.facebookUrl],
    hasMap: settings.contact.mapsUrl,
    priceRange: "$$",
    currenciesAccepted: "AUD",
    areaServed: ["Newport", "Northern Beaches", "Sydney"],
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: settings.brand.name,
    publisher: { "@id": `${siteUrl}/#salon` },
    inLanguage: "en-AU",
  };
}

export function servicesJsonLd(
  services: PublicService[],
  settings: SiteSettings,
) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${settings.brand.name} services`,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        provider: { "@id": `${siteUrl}/#salon` },
        areaServed: "Newport, Sydney",
        url: absoluteUrl(`/book?service=${service.slug}`, siteUrl),
        offers: {
          "@type": "Offer",
          price: (service.priceCents / 100).toFixed(2),
          priceCurrency: "AUD",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/book?service=${service.slug}`, siteUrl),
        },
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

export const staticBreadcrumbs = {
  about: [
    { name: "Home", path: pagePaths.home },
    { name: "About", path: pagePaths.about },
  ],
  services: [
    { name: "Home", path: pagePaths.home },
    { name: "Services", path: pagePaths.services },
  ],
  contact: [
    { name: "Home", path: pagePaths.home },
    { name: "Contact", path: pagePaths.contact },
  ],
  privacy: [
    { name: "Home", path: pagePaths.home },
    { name: "Privacy", path: pagePaths.privacy },
  ],
  terms: [
    { name: "Home", path: pagePaths.home },
    { name: "Terms", path: pagePaths.terms },
  ],
};
