import "server-only";

import { randomInt } from "node:crypto";
import { and, eq, gt, or, sql } from "drizzle-orm";

import type { BookingRequest } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import {
  bookings,
  closures,
  services,
  type BookingRow,
} from "@/lib/db/schema";
import { getSettingsForAdmin } from "@/lib/db/queries";
import {
  calculateDepositCents,
  DEPOSIT_HOLD_MINUTES,
} from "@/lib/payments/deposit";
import { isStripeConfigured } from "@/lib/payments/stripe";
import { getEffectivePriceCents } from "@/lib/utils";

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
  termsVersion: string,
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

  if (!termsVersion.trim()) {
    throw new BookingError(
      "The booking terms are not available. Please call the salon.",
      503,
      "TERMS_UNAVAILABLE",
    );
  }

  if (settings.payments.enabled && !isStripeConfigured()) {
    throw new BookingError(
      "Online payment is not configured. Please call the salon.",
      503,
      "PAYMENTS_UNAVAILABLE",
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

  const effectivePriceCents = getEffectivePriceCents(
    selected.priceCents,
    selected.salePriceCents,
  );
  const depositCents = settings.payments.enabled
    ? calculateDepositCents(
        effectivePriceCents,
        settings.payments.depositPercent,
      )
    : 0;

  if (settings.payments.enabled && depositCents < 50) {
    throw new BookingError(
      "This service cannot be booked with a deposit online. Please call the salon.",
      400,
      "DEPOSIT_UNAVAILABLE",
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
          and(
            eq(bookings.date, input.date),
            or(
              eq(bookings.status, "confirmed"),
              and(
                eq(bookings.status, "pending_payment"),
                eq(bookings.paymentStatus, "pending"),
                gt(bookings.paymentExpiresAt, sql`now()`),
              ),
            ),
          ),
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
        priceCents: effectivePriceCents,
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
        termsAcceptedAt: new Date(),
        termsVersion,
        depositCents,
        paymentStatus: settings.payments.enabled ? "pending" : "not_required",
        paymentExpiresAt: settings.payments.enabled
          ? new Date(Date.now() + DEPOSIT_HOLD_MINUTES * 60 * 1000)
          : null,
        status: settings.payments.enabled ? "pending_payment" : "confirmed",
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
