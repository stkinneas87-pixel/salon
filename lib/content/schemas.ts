import { z } from "zod";

import {
  dayKeys,
  dayLabel,
  pageSlugs,
  type DayKey,
  type PageSlug,
} from "./constants";

export { dayKeys, dayLabel, pageSlugs };
export type { DayKey, PageSlug };

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, for example 09:00");

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Use a valid date");

export const imageRefSchema = z.object({
  src: z
    .string()
    .min(1)
    .refine(
      (value) =>
        (value.startsWith("/") && !value.startsWith("//")) ||
        /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(value),
      "Use an uploaded image or a path inside /public.",
    ),
  alt: z.string().min(1, "Add alt text for accessibility"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type ImageRef = z.infer<typeof imageRefSchema>;

export const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: timeString,
  close: timeString,
});

export type DayHours = z.infer<typeof dayHoursSchema>;

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const siteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    logo: imageRefSchema,
    wordmark: imageRefSchema,
  }),
  contact: z.object({
    phoneDisplay: z.string().min(1),
    phoneE164: z.string().min(1),
    email: z.string(),
    addressLine1: z.string().min(1),
    addressLine2: z.string().min(1),
    addressFull: z.string().min(1),
    addressLocality: z.string().min(1),
    addressRegion: z.string().min(1),
    addressPostcode: z.string().min(1),
    addressCountry: z.string().min(1),
    mapsUrl: z.string().min(1),
    facebookUrl: z.string().min(1),
    whatsappUrl: z.string(),
  }),
  hours: z.object({
    sunday: dayHoursSchema,
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
  }),
  booking: z.object({
    enabled: z.boolean(),
    capacity: z.number().int().min(1).max(20),
    slotIntervalMinutes: z.number().int().min(15).max(120),
    leadTimeMinutes: z.number().int().min(0).max(2880),
    maxAdvanceDays: z.number().int().min(1).max(365),
    notifyEmail: z.string(),
    policyNote: z.string(),
    confirmationNote: z.string(),
  }),
  footer: z.object({
    tagline: z.string(),
    copyright: z.string(),
  }),
  seo: z.object({
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
    defaultOgImage: imageRefSchema.nullable(),
    googleVerification: z.string(),
    bingVerification: z.string(),
  }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const pageSeoSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  ogImage: imageRefSchema.nullable(),
  canonical: z.string(),
  noindex: z.boolean(),
});

export type PageSeo = z.infer<typeof pageSeoSchema>;

export const homeContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    titleLines: z.array(z.string().min(1)).min(1).max(4),
    intro: z.string().min(1),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    image: imageRefSchema,
    sideLabel: z.string(),
  }),
  marquee: z.array(z.string().min(1)).min(1),
  intro: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    image: imageRefSchema,
    caption: z.string(),
  }),
  statement: z.object({
    text: z.string().min(1),
    image: imageRefSchema,
  }),
  servicesPreview: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    body: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  gallery: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    images: z.array(imageRefSchema).min(1),
  }),
  experience: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    items: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
        }),
      )
      .min(1),
  }),
  location: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    body: z.string().min(1),
    image: imageRefSchema,
  }),
  closing: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    primaryLabel: z.string().min(1),
    secondaryLabel: z.string().min(1),
  }),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

export const aboutContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    image: imageRefSchema,
  }),
  story: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  values: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    items: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
        }),
      )
      .min(1),
  }),
  space: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    body: z.string().min(1),
    image: imageRefSchema,
  }),
  gallery: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    images: z.array(imageRefSchema).min(1),
  }),
  closing: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    primaryLabel: z.string().min(1),
  }),
});

export type AboutContent = z.infer<typeof aboutContentSchema>;

export const servicesContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    image: imageRefSchema,
  }),
  intro: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  menu: z.object({
    label: z.string().min(1),
    heading: z.string().min(1),
    note: z.string().min(1),
  }),
  booking: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  closing: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    primaryLabel: z.string().min(1),
  }),
});

export type ServicesContent = z.infer<typeof servicesContentSchema>;

export const contactContentSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    image: imageRefSchema,
  }),
  details: z.object({
    heading: z.string().min(1),
    note: z.string().min(1),
  }),
  hours: z.object({
    heading: z.string().min(1),
  }),
  location: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    image: imageRefSchema,
  }),
  closing: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
    primaryLabel: z.string().min(1),
  }),
});

export type ContactContent = z.infer<typeof contactContentSchema>;

export const privacyContentSchema = z.object({
  title: z.string().min(1),
  updated: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  contactNote: z.string().min(1),
});

export type PrivacyContent = z.infer<typeof privacyContentSchema>;

export type PageContentMap = {
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
  contact: ContactContent;
  privacy: PrivacyContent;
};

export type AnyPageContent = PageContentMap[PageSlug];

export const pageContentSchemas = {
  home: homeContentSchema,
  about: aboutContentSchema,
  services: servicesContentSchema,
  contact: contactContentSchema,
  privacy: privacyContentSchema,
} as const;

export function parsePageContent<S extends PageSlug>(
  slug: S,
  value: unknown,
): PageContentMap[S] {
  return pageContentSchemas[slug].parse(value) as PageContentMap[S];
}

export const serviceInputSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  category: z.string().min(1).max(60),
  description: z.string().min(1).max(800),
  inclusions: z.array(z.string().min(1)).max(20),
  priceCents: z.number().int().min(0).max(100000),
  priceType: z.enum(["fixed", "from"]),
  durationMinutes: z.number().int().min(15).max(480),
  image: imageRefSchema.nullable(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;

export const bookingRequestSchema = z.object({
  serviceId: z.string().uuid(),
  date: dateString,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().min(6).max(40),
  notes: z.string().trim().max(1000),
  consent: z.literal(true),
  website: z.string().max(0),
  startedAt: z.number().int().nonnegative(),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const closureInputSchema = z.object({
  date: dateString,
  allDay: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  reason: z.string().trim().max(200),
});

export type ClosureInput = z.infer<typeof closureInputSchema>;
