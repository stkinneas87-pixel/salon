import "server-only";

import type Stripe from "stripe";

import type { BookingRow } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/content/schemas";
import { getSiteUrl } from "@/lib/seo/metadata";
import { formatPrice } from "@/lib/utils";

import { calculateBalanceCents, DEPOSIT_HOLD_MINUTES } from "./deposit";
import { getStripe } from "./stripe";

export async function createDepositCheckoutSession({
  booking,
  settings,
}: {
  booking: BookingRow;
  settings: SiteSettings;
}): Promise<Stripe.Checkout.Session> {
  const deposit = booking.depositCents;
  if (deposit < 50) {
    throw new Error("The deposit amount is below the Stripe minimum.");
  }

  const balance = calculateBalanceCents(booking.priceCents, deposit);
  const siteUrl = getSiteUrl();
  const fromPriceNote =
    booking.priceType === "from"
      ? " Final price and balance are confirmed in the salon."
      : "";
  const description = `${formatPrice(booking.priceCents, booking.priceType)} service.${settings.payments.depositNote}${
    balance > 0
      ? ` Balance ${formatPrice(balance, "fixed")} payable in salon.`
      : ""
  }${fromPriceNote}`;

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      allowed_payment_method_types: ["card"],
      customer_email: booking.customerEmail,
      client_reference_id: booking.reference,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: deposit,
            product_data: {
              name: `Deposit — ${booking.serviceName}`,
              description,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
        reference: booking.reference,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id,
          reference: booking.reference,
        },
      },
      billing_address_collection: "auto",
      allow_promotion_codes: false,
      submit_type: "pay",
      locale: "en-GB",
      success_url: `${siteUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book?payment=cancelled`,
      expires_at:
        Math.floor(Date.now() / 1000) + DEPOSIT_HOLD_MINUTES * 60 + 60,
    },
    {
      idempotencyKey: `deposit:${booking.id}:${deposit}`,
    },
  );

  return session;
}
