import type Stripe from "stripe";
import { after, NextResponse } from "next/server";

import {
  markCheckoutSessionExpired,
  markCheckoutSessionPaid,
  sendPaidBookingEmails,
} from "@/lib/payments/fulfill";
import { reconcileRefund } from "@/lib/payments/refund";
import {
  getStripe,
  getStripeWebhookSecret,
} from "@/lib/payments/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const result = await markCheckoutSessionPaid(
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );

      if (result.mismatch) {
        console.error("Stripe session mismatch or amount mismatch", event.id);
        return NextResponse.json({ error: "Session mismatch." }, { status: 400 });
      }
      if (result.missing) {
        console.error("Stripe session has no matching booking", event.id);
        return NextResponse.json({ error: "Booking not found." }, { status: 500 });
      }
      if (result.booking && result.sendEmails) {
        const booking = result.booking;
        after(async () => {
          await sendPaidBookingEmails(booking);
        });
      }
    } else if (event.type === "checkout.session.expired") {
      await markCheckoutSessionExpired(
        event.data.object as Stripe.Checkout.Session,
        event.id,
      );
    } else if (event.type === "charge.refunded") {
      await reconcileRefund(event.data.object as Stripe.Charge, event.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", event.id, error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}
