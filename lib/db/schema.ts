import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type {
  AnyPageContent,
  ImageRef,
  PageSeo,
  SiteSettings,
} from "@/lib/content/schemas";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "not_required",
  "pending",
  "paid",
  "refunded",
  "failed",
  "expired",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "sent",
  "failed",
  "skipped",
]);

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").$type<SiteSettings>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pages = pgTable("pages", {
  slug: text("slug").primaryKey(),
  content: jsonb("content").$type<AnyPageContent>().notNull(),
  seo: jsonb("seo").$type<PageSeo>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    inclusions: jsonb("inclusions").$type<string[]>().notNull().default([]),
    priceCents: integer("price_cents").notNull(),
    priceType: text("price_type").$type<"fixed" | "from">().notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    image: jsonb("image").$type<ImageRef | null>(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    isSample: boolean("is_sample").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("services_active_sort_idx").on(table.active, table.sortOrder),
    index("services_category_idx").on(table.category),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull().unique(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    serviceName: text("service_name").notNull(),
    priceCents: integer("price_cents").notNull(),
    priceType: text("price_type").$type<"fixed" | "from">().notNull().default("fixed"),
    durationMinutes: integer("duration_minutes").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    notes: text("notes").notNull().default(""),
    internalNotes: text("internal_notes").notNull().default(""),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    termsVersion: text("terms_version"),
    depositCents: integer("deposit_cents").notNull().default(0),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("not_required"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    paymentExpiresAt: timestamp("payment_expires_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundId: text("refund_id"),
    refundedBy: text("refunded_by"),
    status: bookingStatusEnum("status").notNull().default("confirmed"),
    ownerEmailStatus: emailStatusEnum("owner_email_status")
      .notNull()
      .default("skipped"),
    customerEmailStatus: emailStatusEnum("customer_email_status")
      .notNull()
      .default("skipped"),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bookings_date_status_idx").on(table.date, table.status),
    index("bookings_created_at_idx").on(table.createdAt),
    index("bookings_ip_created_idx").on(table.ipHash, table.createdAt),
    index("bookings_payment_status_idx").on(
      table.paymentStatus,
      table.paymentExpiresAt,
    ),
    uniqueIndex("bookings_stripe_session_idx").on(table.stripeSessionId),
    index("bookings_stripe_payment_intent_idx").on(table.stripePaymentIntentId),
  ],
);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const closures = pgTable(
  "closures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    reason: text("reason").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("closures_date_idx").on(table.date)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ipHash: text("ip_hash").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("login_attempts_ip_time_idx").on(table.ipHash, table.attemptedAt),
  ],
);

export type ServiceRow = typeof services.$inferSelect;
export type BookingRow = typeof bookings.$inferSelect;
export type ClosureRow = typeof closures.$inferSelect;
export type PageRow = typeof pages.$inferSelect;
