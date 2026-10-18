import "server-only";

import type Stripe from "stripe";
import { and, eq } from "drizzle-orm";

import { requireDb } from "@/lib/db/client";
import { bookings, stripeEvents } from "@/lib/db/schema";
import type { BookingRow } from "@/lib/db/schema";

import { getStripe } from "./stripe";

export async function refundDeposit(booking: BookingRow, refundedBy: string) {
  if (booking.paymentStatus !== "paid" || !booking.stripePaymentIntentId) {
    throw new Error("Only a paid deposit can be refunded.");
  }
  if (booking.depositCents <= 0) {
    throw new Error("This booking has no deposit to refund.");
  }

  const stripe = getStripe();
  const refund = await stripe.refunds.create(
    {
      payment_intent: booking.stripePaymentIntentId,
      amount: booking.depositCents,
      metadata: {
        bookingId: booking.id,
        reference: booking.reference,
      },
    },
    {
      idempotencyKey: `refund:${booking.id}:${booking.depositCents}`,
    },
  );

  const db = requireDb();
  await db
    .update(bookings)
    .set({
      paymentStatus: "refunded",
      refundedAt: new Date(),
      refundId: refund.id,
      refundedBy,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(bookings.id, booking.id),
        eq(bookings.paymentStatus, "paid"),
      ),
    );

  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, booking.id))
    .limit(1);

  return rows[0] ?? booking;
}

export async function reconcileRefund(
  charge: Stripe.Charge,
  eventId: string,
) {
  const paymentIntent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntent) return null;

  const db = requireDb();
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(stripeEvents)
      .values({ id: eventId, type: "charge.refunded" })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (inserted.length === 0) return null;

    const rows = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.stripePaymentIntentId, paymentIntent))
      .limit(1);
    const booking = rows[0];
    if (!booking) {
      throw new Error("Refund event received before its booking payment was recorded.");
    }
    if (booking.paymentStatus === "refunded") return booking;
    if (booking.paymentStatus !== "paid") {
      throw new Error("Refund event received before payment was marked paid.");
    }

    // A partial refund must not be presented as a full deposit refund.
    if (!charge.refunded || charge.amount_refunded < booking.depositCents) {
      console.warn(
        "Stripe partial refund received; booking left as paid",
        booking.reference,
      );
      return booking;
    }

    const [updated] = await tx
      .update(bookings)
      .set({
        paymentStatus: "refunded",
        refundedAt: new Date(),
        refundId:
          charge.refunds?.data?.[0]?.id ?? booking.refundId ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.id, booking.id),
          eq(bookings.paymentStatus, "paid"),
        ),
      )
      .returning();

    return updated ?? booking;
  });
}
