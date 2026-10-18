import "server-only";

import { randomInt } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";

import type { BookingRequest } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import {
  bookings,
  closures,
  services,
  type BookingRow,
} from "@/lib/db/schema";
import { getSettingsForAdmin } from "@/lib/db/queries";

import { validateRequestedSlot } from "./slots";

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export class BookingError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "BOOKING_ERROR") {
    super(message);
    this.name = "BookingError";
    this.status = status;
    this.code = code;
  }
}

export function createReference() {
  let value = "HC-";
  for (let index = 0; index < 6; index++) {
    value += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  }
  return value;
}

export async function createBooking(
  input: BookingRequest,
  ipHash: string | null,
): Promise<BookingRow> {
  const db = requireDb();
  const settings = await getSettingsForAdmin();

  if (!settings.booking.enabled) {
    throw new BookingError(
      "Online booking is currently paused. Please call the salon.",
      503,
      "BOOKING_DISABLED",
    );
  }

  const service = await db
    .select()
    .from(services)
    .where(eq(services.id, input.serviceId))
    .limit(1);

  const selected = service[0];
  if (!selected || !selected.active || selected.isSample) {
    throw new BookingError(
      "That service is not available. Please choose another service.",
      400,
      "SERVICE_UNAVAILABLE",
    );
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${input.date}))`,
    );

    const [existing, dayClosures] = await Promise.all([
      tx
        .select({
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          status: bookings.status,
        })
        .from(bookings)
        .where(
          and(eq(bookings.date, input.date), eq(bookings.status, "confirmed")),
        ),
      tx.select().from(closures).where(eq(closures.date, input.date)),
    ]);

    const validation = validateRequestedSlot({
      date: input.date,
      time: input.time,
      durationMinutes: selected.durationMinutes,
      settings,
      bookings: existing,
      closures: dayClosures,
      now: new Date(),
    });

    if (!validation.ok) {
      throw new BookingError(
        validation.reason,
        409,
        "SLOT_UNAVAILABLE",
      );
    }

    const reference = createReference();

    const [row] = await tx
      .insert(bookings)
      .values({
        reference,
        serviceId: selected.id,
        serviceName: selected.name,
        priceCents: selected.priceCents,
        priceType: selected.priceType,
        durationMinutes: selected.durationMinutes,
        date: input.date,
        startTime: input.time,
        endTime: validation.endTime,
        customerName: input.name,
        customerEmail: input.email,
        customerPhone: input.phone,
        notes: input.notes,
        consentAt: new Date(),
        status: "confirmed",
        ipHash,
      })
      .returning();

    if (!row) {
      throw new BookingError(
        "The booking could not be saved. Please try again.",
        500,
        "BOOKING_SAVE_FAILED",
      );
    }

    return row;
  });
}
