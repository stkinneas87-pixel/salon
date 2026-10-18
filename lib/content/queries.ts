import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDb } from "@/lib/db/client";
import { pages, services, siteSettings, type ServiceRow } from "@/lib/db/schema";

import { defaultPages, defaultSettings } from "./defaults";
import { mergeDefaults } from "./merge";
import {
  pageContentSchemas,
  pageSeoSchema,
  siteSettingsSchema,
  type PageContentMap,
  type PageSeo,
  type PageSlug,
  type SiteSettings,
} from "./schemas";

export type PublicService = Pick<
  ServiceRow,
  | "id"
  | "slug"
  | "category"
  | "name"
  | "description"
  | "inclusions"
  | "priceCents"
  | "priceType"
  | "durationMinutes"
  | "image"
  | "sortOrder"
  | "isSample"
>;

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("content");

  const db = getDb();
  if (!db) return defaultSettings;

  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    if (!rows[0]) return defaultSettings;
    return siteSettingsSchema.parse(
      mergeDefaults(defaultSettings, rows[0].data),
    );
  } catch (error) {
    console.error("Unable to load site settings", error);
    return defaultSettings;
  }
}

export async function getPage<S extends PageSlug>(
  slug: S,
): Promise<{ content: PageContentMap[S]; seo: PageSeo }> {
  "use cache";
  cacheLife("hours");
  cacheTag("content");

  const fallback = defaultPages[slug];
  const db = getDb();
  if (!db) {
    return {
      content: fallback.content as PageContentMap[S],
      seo: fallback.seo,
    };
  }

  try {
    const rows = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
    const row = rows[0];

    if (!row) {
      return {
        content: fallback.content as PageContentMap[S],
        seo: fallback.seo,
      };
    }

    const content = pageContentSchemas[slug].parse(
      mergeDefaults(fallback.content, row.content),
    ) as PageContentMap[S];
    const seo = pageSeoSchema.parse(mergeDefaults(fallback.seo, row.seo));

    return { content, seo };
  } catch (error) {
    console.error(`Unable to load page "${slug}"`, error);
    return {
      content: fallback.content as PageContentMap[S],
      seo: fallback.seo,
    };
  }
}

export async function getPublicServices(): Promise<PublicService[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("content");

  const db = getDb();
  if (!db) {
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("DATABASE_URL is not configured.");
    }
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(services)
      .where(and(eq(services.active, true), eq(services.isSample, false)))
      .orderBy(asc(services.sortOrder), asc(services.name));

    return rows.map((service) => ({
      id: service.id,
      slug: service.slug,
      category: service.category,
      name: service.name,
      description: service.description,
      inclusions: service.inclusions,
      priceCents: service.priceCents,
      priceType: service.priceType,
      durationMinutes: service.durationMinutes,
      image: service.image,
      sortOrder: service.sortOrder,
      isSample: service.isSample,
    }));
  } catch (error) {
    console.error("Unable to load services", error);
    if (process.env.NODE_ENV === "production") throw error;
    return [];
  }
}

export async function getSitemapPages() {
  "use cache";
  cacheLife("days");
  cacheTag("content");

  const fallback: Partial<Record<PageSlug, Date>> = {
    home: new Date(),
    about: new Date(),
    services: new Date(),
    contact: new Date(),
    privacy: new Date(),
    terms: new Date(),
  };

  const db = getDb();
  if (!db) return fallback;

  try {
    const rows = await db.select().from(pages);
    for (const row of rows) {
      if (row.slug in fallback) {
        if (row.seo.noindex) delete fallback[row.slug as PageSlug];
        else fallback[row.slug as PageSlug] = row.updatedAt;
      }
    }
  } catch (error) {
    console.error("Unable to load sitemap timestamps", error);
  }

  return fallback;
}
