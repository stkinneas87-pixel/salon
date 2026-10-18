import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  sql,
} from "drizzle-orm";

import { defaultSettings } from "@/lib/content/defaults";
import { mergeDefaults } from "@/lib/content/merge";
import {
  siteSettingsSchema,
  type PageSlug,
  type SiteSettings,
} from "@/lib/content/schemas";
import { addDays, getSydneyToday } from "@/lib/utils";

import { requireDb } from "./client";
import {
  bookings,
  closures,
  pages,
  services,
  siteSettings,
  type BookingRow,
  type ClosureRow,
  type ServiceRow,
} from "./schema";

export async function getSettingsForAdmin(): Promise<SiteSettings> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (!rows[0]) return defaultSettings;
  return siteSettingsSchema.parse(mergeDefaults(defaultSettings, rows[0].data));
}

export async function getPageRowForAdmin(slug: PageSlug) {
  const db = requireDb();
  const rows = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getAllServices(): Promise<ServiceRow[]> {
  const db = requireDb();
  return db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.name));
}

export async function getServiceById(id: string): Promise<ServiceRow | null> {
  const db = requireDb();
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const db = requireDb();
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getConfirmedBookingsForDate(date: string) {
  const db = requireDb();
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.date, date), eq(bookings.status, "confirmed")))
    .orderBy(asc(bookings.startTime));
}

export async function getClosuresForDate(date: string): Promise<ClosureRow[]> {
  const db = requireDb();
  return db.select().from(closures).where(eq(closures.date, date));
}

export async function getUpcomingClosures() {
  const db = requireDb();
  return db
    .select()
    .from(closures)
    .where(gte(closures.date, getSydneyToday()))
    .orderBy(asc(closures.date), asc(closures.startTime));
}

export type BookingFilters = {
  status?: "confirmed" | "cancelled" | "completed" | "no_show";
  date?: string;
  page?: number;
  pageSize?: number;
};

export async function getBookings({
  status,
  date,
  page = 1,
  pageSize = 20,
}: BookingFilters = {}) {
  const db = requireDb();
  const conditions = [];
  if (status) conditions.push(eq(bookings.status, status));
  if (date) conditions.push(eq(bookings.date, date));
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, totalRow] = await Promise.all([
    db
      .select()
      .from(bookings)
      .where(where)
      .orderBy(desc(bookings.date), desc(bookings.startTime))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(bookings).where(where),
  ]);

  return {
    items,
    total: totalRow[0]?.value ?? 0,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil((totalRow[0]?.value ?? 0) / pageSize)),
  };
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  const db = requireDb();
  const rows = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getDashboardData() {
  const db = requireDb();
  const today = getSydneyToday();
  const weekEnd = addDays(today, 6);

  const [todayCount, weekCount, sampleCount, recent] = await Promise.all([
    db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(eq(bookings.date, today), eq(bookings.status, "confirmed")),
      ),
    db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.date, today),
          lte(bookings.date, weekEnd),
          eq(bookings.status, "confirmed"),
        ),
      ),
    db
      .select({ value: count() })
      .from(services)
      .where(eq(services.isSample, true)),
    db
      .select()
      .from(bookings)
      .where(gte(bookings.date, today))
      .orderBy(asc(bookings.date), asc(bookings.startTime))
      .limit(6),
  ]);

  return {
    today,
    todayCount: todayCount[0]?.value ?? 0,
    weekCount: weekCount[0]?.value ?? 0,
    sampleCount: sampleCount[0]?.value ?? 0,
    recent,
  };
}

export async function countRecentBookingsByIp(ipHash: string) {
  const db = requireDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ value: count() })
    .from(bookings)
    .where(
      and(eq(bookings.ipHash, ipHash), gte(bookings.createdAt, since)),
    );
  return row?.value ?? 0;
}

export async function countServiceBookings(serviceId: string) {
  const db = requireDb();
  const [row] = await db
    .select({ value: count() })
    .from(bookings)
    .where(eq(bookings.serviceId, serviceId));
  return row?.value ?? 0;
}

export async function getBookingsForCsv(date?: string) {
  const db = requireDb();
  return db
    .select()
    .from(bookings)
    .where(date ? eq(bookings.date, date) : undefined)
    .orderBy(desc(bookings.date), asc(bookings.startTime));
}

export async function updateBookingStatus(
  id: string,
  status: "confirmed" | "cancelled" | "completed" | "no_show",
) {
  const db = requireDb();
  await db
    .update(bookings)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(bookings.id, id));
}

export async function deleteBookingById(id: string) {
  const db = requireDb();
  await db.delete(bookings).where(eq(bookings.id, id));
}

export async function updateBookingEmailStatuses(
  id: string,
  owner: "sent" | "failed" | "skipped",
  customer: "sent" | "failed" | "skipped",
) {
  const db = requireDb();
  await db
    .update(bookings)
    .set({
      ownerEmailStatus: owner,
      customerEmailStatus: customer,
      updatedAt: sql`now()`,
    })
    .where(eq(bookings.id, id));
}
