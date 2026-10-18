import "server-only";

import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";

import { requireDb } from "@/lib/db/client";
import { bookings, stripeEvents, type BookingRow } from "@/lib/db/schema";
import { getSettingsForAdmin, updateBookingEmailStatuses } from "@/lib/db/queries";
import { sendBookingEmails } from "@/lib/email/send";

export type FulfillResult = {
  booking: BookingRow | null;
  sendEmails: boolean;
  duplicate: boolean;
  missing: boolean;
  mismatch: boolean;
};

export async function markCheckoutSessionPaid(
  session: Stripe.Checkout.Session,
  eventId?: string,
): Promise<FulfillResult> {
  if (session.payment_status !== "paid") {
    return { booking: null, sendEmails: false, duplicate: false, missing: false, mismatch: false };
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId || session.currency !== "aud" || session.amount_total == null) {
    return { booking: null, sendEmails: false, duplicate: false, missing: true, mismatch: true };
  }

  const db = requireDb();
  return db.transaction(async (tx) => {
    if (eventId) {
      const inserted = await tx
        .insert(stripeEvents)
        .values({ id: eventId, type: "checkout.session.completed" })
        .onConflictDoNothing()
        .returning({ id: stripeEvents.id });
      if (inserted.length === 0) {
        return { booking: null, sendEmails: false, duplicate: true, missing: false, mismatch: false };
      }
    }

    const rows = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);
    const existing = rows[0];

    if (!existing) {
      throw new Error("Checkout session booking was not found.");
    }

    if (
      (existing.stripeSessionId && existing.stripeSessionId !== session.id) ||
      existing.depositCents !== session.amount_total
    ) {
      return { booking: null, sendEmails: false, duplicate: false, missing: false, mismatch: true };
    }

    if (existing.paymentStatus !== "pending") {
      return { booking: existing, sendEmails: false, duplicate: false, missing: false, mismatch: false };
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;
    const nextStatus =
      existing.status === "pending_payment" ? "confirmed" : existing.status;
    const shouldEmail = nextStatus === "confirmed";

    const [updated] = await tx
      .update(bookings)
      .set({
        status: nextStatus,
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.id, existing.id),
          eq(bookings.paymentStatus, "pending"),
        ),
      )
      .returning();

    return {
      booking: updated ?? null,
      sendEmails: Boolean(updated && shouldEmail),
      duplicate: !updated,
      missing: false,
      mismatch: false,
    };
  });
}

export async function markCheckoutSessionExpired(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return null;

  const db = requireDb();
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(stripeEvents)
      .values({ id: eventId, type: "checkout.session.expired" })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (inserted.length === 0) return null;

    const [updated] = await tx
      .update(bookings)
      .set({
        status: "cancelled",
        paymentStatus: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.status, "pending_payment"),
          eq(bookings.paymentStatus, "pending"),
        ),
      )
      .returning();

    return updated ?? null;
  });
}

export async function sendPaidBookingEmails(booking: BookingRow) {
  try {
    const settings = await getSettingsForAdmin();
    const statuses = await sendBookingEmails(booking, settings);
    await updateBookingEmailStatuses(
      booking.id,
      statuses.owner,
      statuses.customer,
    );
    return statuses;
  } catch (error) {
    console.error("Paid booking emails failed", error);
    return { owner: "failed" as const, customer: "failed" as const };
  }
}
