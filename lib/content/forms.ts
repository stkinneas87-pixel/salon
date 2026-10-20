import type { FieldDef, FormSection } from "@/components/admin/fields";

export const seoFields: FieldDef[] = [
  { type: "text", name: "title", label: "SEO title", help: "Aim for 50–60 characters. Include the page and Newport." },
  { type: "textarea", name: "description", label: "Meta description", rows: 3, help: "Aim for 140–160 characters." },
  { type: "image", name: "ogImage", label: "Social sharing image", help: "1200 × 630 is ideal. Falls back to the site default." },
  { type: "text", name: "canonical", label: "Canonical override", help: "Leave blank to use this page's URL." },
  { type: "boolean", name: "noindex", label: "Hide this page from search engines", help: "Only enable if you intentionally want the page out of Google." },
];

export const homeFormSections: FormSection[] = [
  {
    title: "Hero",
    description: "The first screen on the home page.",
    fields: [
      { type: "text", name: "hero.eyebrow", label: "Eyebrow" },
      { type: "stringList", name: "hero.titleLines", label: "Title lines", itemLabel: "line" },
      { type: "textarea", name: "hero.intro", label: "Intro", rows: 3 },
      { type: "object", name: "hero.primaryCta", label: "Primary button", fields: [
        { type: "text", name: "label", label: "Label" },
        { type: "text", name: "href", label: "Link" },
      ] },
      { type: "object", name: "hero.secondaryCta", label: "Secondary button", fields: [
        { type: "text", name: "label", label: "Label" },
        { type: "text", name: "href", label: "Link" },
      ] },
      { type: "text", name: "hero.sideLabel", label: "Small side label" },
      { type: "image", name: "hero.image", label: "Hero image" },
    ],
  },
  {
    title: "Marquee",
    description: "The scrolling black band beneath the hero.",
    fields: [
      { type: "stringList", name: "marquee", label: "Words", itemLabel: "word" },
    ],
  },
  {
    title: "Introduction",
    fields: [
      { type: "text", name: "intro.label", label: "Label" },
      { type: "text", name: "intro.heading", label: "Heading" },
      { type: "stringList", name: "intro.paragraphs", label: "Paragraphs", itemLabel: "paragraph" },
      { type: "image", name: "intro.image", label: "Image" },
      { type: "text", name: "intro.caption", label: "Caption" },
    ],
  },
  {
    title: "Statement band",
    fields: [
      { type: "textarea", name: "statement.text", label: "Statement", rows: 3 },
      { type: "image", name: "statement.image", label: "Background image" },
    ],
  },
  {
    title: "Services preview",
    fields: [
      { type: "text", name: "servicesPreview.label", label: "Label" },
      { type: "text", name: "servicesPreview.heading", label: "Heading" },
      { type: "textarea", name: "servicesPreview.body", label: "Body", rows: 3 },
      { type: "text", name: "servicesPreview.ctaLabel", label: "Link label" },
    ],
  },
  {
    title: "Gallery",
    fields: [
      { type: "text", name: "gallery.label", label: "Label" },
      { type: "text", name: "gallery.heading", label: "Heading" },
      { type: "imageList", name: "gallery.images", label: "Images" },
    ],
  },
  {
    title: "Experience",
    fields: [
      { type: "text", name: "experience.label", label: "Label" },
      { type: "text", name: "experience.heading", label: "Heading" },
      {
        type: "objectList",
        name: "experience.items",
        label: "Points",
        itemLabel: "Point",
        min: 1,
        fields: [
          { type: "text", name: "title", label: "Title" },
          { type: "textarea", name: "body", label: "Body", rows: 3 },
        ],
      },
    ],
  },
  {
    title: "Location",
    fields: [
      { type: "text", name: "location.label", label: "Label" },
      { type: "text", name: "location.heading", label: "Heading" },
      { type: "textarea", name: "location.body", label: "Body", rows: 3 },
      { type: "image", name: "location.image", label: "Image" },
    ],
  },
  {
    title: "Closing call to action",
    fields: [
      { type: "text", name: "closing.heading", label: "Heading" },
      { type: "textarea", name: "closing.body", label: "Body", rows: 3 },
      { type: "text", name: "closing.primaryLabel", label: "Primary label" },
      { type: "text", name: "closing.secondaryLabel", label: "Secondary label" },
    ],
  },
];

export const aboutFormSections: FormSection[] = [
  {
    title: "Hero",
    fields: [
      { type: "text", name: "hero.eyebrow", label: "Eyebrow" },
      { type: "text", name: "hero.title", label: "Title" },
      { type: "textarea", name: "hero.intro", label: "Intro", rows: 3 },
      { type: "image", name: "hero.image", label: "Hero image" },
    ],
  },
  {
    title: "Story",
    fields: [
      { type: "text", name: "story.label", label: "Label" },
      { type: "text", name: "story.heading", label: "Heading" },
      { type: "stringList", name: "story.paragraphs", label: "Paragraphs", itemLabel: "paragraph" },
    ],
  },
  {
    title: "Values",
    fields: [
      { type: "text", name: "values.label", label: "Label" },
      { type: "text", name: "values.heading", label: "Heading" },
      {
        type: "objectList",
        name: "values.items",
        label: "Values",
        itemLabel: "Value",
        min: 1,
        fields: [
          { type: "text", name: "title", label: "Title" },
          { type: "textarea", name: "body", label: "Body", rows: 3 },
        ],
      },
    ],
  },
  {
    title: "The space",
    fields: [
      { type: "text", name: "space.label", label: "Label" },
      { type: "text", name: "space.heading", label: "Heading" },
      { type: "textarea", name: "space.body", label: "Body", rows: 3 },
      { type: "image", name: "space.image", label: "Image" },
    ],
  },
  {
    title: "Gallery",
    fields: [
      { type: "text", name: "gallery.label", label: "Label" },
      { type: "text", name: "gallery.heading", label: "Heading" },
      { type: "imageList", name: "gallery.images", label: "Images" },
    ],
  },
  {
    title: "Closing call to action",
    fields: [
      { type: "text", name: "closing.heading", label: "Heading" },
      { type: "textarea", name: "closing.body", label: "Body", rows: 3 },
      { type: "text", name: "closing.primaryLabel", label: "Primary label" },
    ],
  },
];

export const servicesFormSections: FormSection[] = [
  {
    title: "Hero",
    fields: [
      { type: "text", name: "hero.eyebrow", label: "Eyebrow" },
      { type: "text", name: "hero.title", label: "Title" },
      { type: "textarea", name: "hero.intro", label: "Intro", rows: 3 },
      { type: "image", name: "hero.image", label: "Hero image" },
    ],
  },
  {
    title: "Introduction",
    fields: [
      { type: "text", name: "intro.label", label: "Label" },
      { type: "text", name: "intro.heading", label: "Heading" },
      { type: "stringList", name: "intro.paragraphs", label: "Paragraphs", itemLabel: "paragraph" },
    ],
  },
  {
    title: "Menu heading",
    fields: [
      { type: "text", name: "menu.label", label: "Label" },
      { type: "text", name: "menu.heading", label: "Heading" },
      { type: "text", name: "menu.note", label: "Note" },
    ],
  },
  {
    title: "Booking note",
    fields: [
      { type: "text", name: "booking.heading", label: "Heading" },
      { type: "textarea", name: "booking.body", label: "Body", rows: 3 },
    ],
  },
  {
    title: "Closing call to action",
    fields: [
      { type: "text", name: "closing.heading", label: "Heading" },
      { type: "textarea", name: "closing.body", label: "Body", rows: 3 },
      { type: "text", name: "closing.primaryLabel", label: "Primary label" },
    ],
  },
];

export const contactFormSections: FormSection[] = [
  {
    title: "Hero",
    fields: [
      { type: "text", name: "hero.eyebrow", label: "Eyebrow" },
      { type: "text", name: "hero.title", label: "Title" },
      { type: "textarea", name: "hero.intro", label: "Intro", rows: 3 },
      { type: "image", name: "hero.image", label: "Hero image" },
    ],
  },
  {
    title: "Details",
    fields: [
      { type: "text", name: "details.heading", label: "Heading" },
      { type: "text", name: "details.note", label: "Note" },
    ],
  },
  {
    title: "Hours",
    fields: [
      { type: "text", name: "hours.heading", label: "Heading" },
    ],
  },
  {
    title: "Location",
    fields: [
      { type: "text", name: "location.heading", label: "Heading" },
      { type: "textarea", name: "location.body", label: "Body", rows: 3 },
      { type: "image", name: "location.image", label: "Image" },
    ],
  },
  {
    title: "Closing call to action",
    fields: [
      { type: "text", name: "closing.heading", label: "Heading" },
      { type: "textarea", name: "closing.body", label: "Body", rows: 3 },
      { type: "text", name: "closing.primaryLabel", label: "Primary label" },
    ],
  },
];

export const privacyFormSections: FormSection[] = [
  {
    title: "Policy",
    fields: [
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "updated", label: "Last updated" },
      { type: "stringList", name: "paragraphs", label: "Paragraphs", itemLabel: "paragraph" },
      { type: "textarea", name: "contactNote", label: "Contact note", rows: 3 },
    ],
  },
];

export const termsFormSections: FormSection[] = [
  {
    title: "Terms",
    description:
      "Increment the version whenever any policy wording changes. The version shown at checkout is stored with each booking.",
    fields: [
      { type: "text", name: "title", label: "Title" },
      { type: "text", name: "version", label: "Version", help: "Increment this whenever a policy term changes. It is stored with every booking." },
      { type: "text", name: "effectiveDate", label: "Effective date" },
      {
        type: "objectList",
        name: "sections",
        label: "Sections",
        itemLabel: "Section",
        min: 1,
        fields: [
          { type: "text", name: "title", label: "Heading" },
          { type: "stringList", name: "paragraphs", label: "Paragraphs", itemLabel: "paragraph" },
        ],
      },
      { type: "textarea", name: "contactNote", label: "Contact note", rows: 3 },
    ],
  },
];

export const pageFormSections = {
  home: homeFormSections,
  about: aboutFormSections,
  services: servicesFormSections,
  contact: contactFormSections,
  privacy: privacyFormSections,
  terms: termsFormSections,
} as const;

const dayFields = (name: string, label: string): FieldDef => ({
  type: "object",
  name,
  label,
  fields: [
    { type: "boolean", name: "closed", label: "Closed all day" },
    { type: "time", name: "open", label: "Opens" },
    { type: "time", name: "close", label: "Closes" },
  ],
});

export const settingsFormSections: FormSection[] = [
  {
    title: "Brand",
    fields: [
      { type: "text", name: "brand.name", label: "Business name" },
      {
        type: "text",
        name: "brand.abn",
        label: "ABN (optional)",
        help: "Printed on the tax invoice PDF. Leave empty to hide it.",
      },
      { type: "image", name: "brand.wordmark", label: "Wordmark" },
      { type: "image", name: "brand.logo", label: "Logo mark" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { type: "text", name: "contact.phoneDisplay", label: "Phone (display)" },
      { type: "text", name: "contact.phoneE164", label: "Phone (tel: link)" },
      { type: "text", name: "contact.email", label: "Public email (optional)" },
      { type: "text", name: "contact.addressLine1", label: "Address line 1" },
      { type: "text", name: "contact.addressLine2", label: "Address line 2" },
      { type: "text", name: "contact.addressFull", label: "Full address (search)" },
      { type: "text", name: "contact.addressLocality", label: "Suburb / locality" },
      { type: "text", name: "contact.addressRegion", label: "State / region" },
      { type: "text", name: "contact.addressPostcode", label: "Postcode" },
      { type: "text", name: "contact.addressCountry", label: "Country code" },
      { type: "text", name: "contact.mapsUrl", label: "Google Maps link" },
      { type: "text", name: "contact.facebookUrl", label: "Facebook URL" },
      {
        type: "text",
        name: "contact.whatsappUrl",
        label: "WhatsApp link",
        help: "Use https://wa.me/61412601878 with the country code and no spaces. Leave empty to hide WhatsApp.",
      },
    ],
  },
  {
    title: "Opening hours",
    description: "Used on the site, in schema and for booking availability.",
    fields: [
      dayFields("hours.sunday", "Sunday"),
      dayFields("hours.monday", "Monday"),
      dayFields("hours.tuesday", "Tuesday"),
      dayFields("hours.wednesday", "Wednesday"),
      dayFields("hours.thursday", "Thursday"),
      dayFields("hours.friday", "Friday"),
      dayFields("hours.saturday", "Saturday"),
    ],
  },
  {
    title: "Booking rules",
    description: "Capacity is salon-wide, not per stylist.",
    fields: [
      { type: "boolean", name: "booking.enabled", label: "Online booking enabled" },
      { type: "number", name: "booking.capacity", label: "Concurrent appointments", min: 1, max: 20 },
      { type: "number", name: "booking.slotIntervalMinutes", label: "Slot interval (minutes)", min: 15, max: 120, step: 15 },
      { type: "number", name: "booking.leadTimeMinutes", label: "Minimum notice (minutes)", min: 0, max: 2880, step: 15 },
      { type: "number", name: "booking.maxAdvanceDays", label: "Booking window (days)", min: 1, max: 365 },
      { type: "text", name: "booking.notifyEmail", label: "Booking notification email" },
      { type: "textarea", name: "booking.policyNote", label: "Cancellation / change note", rows: 3 },
      { type: "textarea", name: "booking.confirmationNote", label: "Confirmation note", rows: 3 },
    ],
  },
  {
    title: "Payments",
    description:
      "Stripe test/live mode is controlled by STRIPE_SECRET_KEY. Test mode should only be used on preview or local environments.",
    fields: [
      {
        type: "boolean",
        name: "payments.enabled",
        label: "Require a deposit with Stripe",
        help: "When enabled, online booking is blocked if Stripe is not configured.",
      },
      {
        type: "number",
        name: "payments.depositPercent",
        label: "Deposit percentage",
        min: 1,
        max: 100,
        help: "Percentage of the listed service price, rounded to the nearest dollar.",
      },
      {
        type: "textarea",
        name: "payments.depositNote",
        label: "Deposit note",
        rows: 3,
      },
    ],
  },
  {
    title: "Footer",
    fields: [
      { type: "textarea", name: "footer.tagline", label: "Tagline", rows: 2 },
      { type: "text", name: "footer.copyright", label: "Copyright line" },
    ],
  },
  {
    title: "SEO defaults",
    description: "Used when a page has no specific SEO override.",
    fields: [
      { type: "text", name: "seo.defaultTitle", label: "Default title" },
      { type: "textarea", name: "seo.defaultDescription", label: "Default description", rows: 3 },
      { type: "image", name: "seo.defaultOgImage", label: "Default social image" },
      { type: "text", name: "seo.googleVerification", label: "Google Search Console code" },
      { type: "text", name: "seo.bingVerification", label: "Bing verification code" },
    ],
  },
];

export const serviceFields: FieldDef[] = [
  { type: "text", name: "name", label: "Service name" },
  { type: "text", name: "slug", label: "Slug", help: "Used in the booking link. Lowercase letters, numbers and hyphens." },
  { type: "text", name: "category", label: "Category", help: "For example: Cuts, Colour, Treatments, Styling." },
  { type: "textarea", name: "description", label: "Description", rows: 3 },
  { type: "stringList", name: "inclusions", label: "What's included", itemLabel: "inclusion" },
  { type: "money", name: "priceCents", label: "Price (AUD)" },
  {
    type: "moneyOptional",
    name: "salePriceCents",
    label: "Discounted price (optional)",
    help: "Leave blank for no discount. Must be lower than the normal price. This is used for booking deposits.",
  },
  {
    type: "select",
    name: "priceType",
    label: "Price type",
    options: [
      { value: "fixed", label: "Fixed price" },
      { value: "from", label: "From price" },
    ],
  },
  { type: "number", name: "durationMinutes", label: "Duration (minutes)", min: 15, max: 480, step: 15 },
  { type: "number", name: "sortOrder", label: "Sort order", min: 0, max: 9999 },
  { type: "boolean", name: "active", label: "Visible and bookable" },
  { type: "image", name: "image", label: "Service image (optional)" },
];
