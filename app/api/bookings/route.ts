import { after, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getIpFromHeaders, hashIp } from "@/lib/auth/ip";
import { BookingError, createBooking } from "@/lib/booking/create";
import { getPage } from "@/lib/content/queries";
import { bookingRequestSchema } from "@/lib/content/schemas";
import {
  cancelPendingBooking,
  countActivePendingBookingsByIp,
  countRecentBookingsByIp,
  getSettingsForAdmin,
  setBookingStripeSession,
  updateBookingEmailStatuses,
} from "@/lib/db/queries";
import { sendBookingEmails } from "@/lib/email/send";
import { createDepositCheckoutSession } from "@/lib/payments/checkout";
import { getStripe } from "@/lib/payments/stripe";
import { getSiteUrl } from "@/lib/seo/metadata";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get("host");
    const siteHost = new URL(getSiteUrl()).host;
    return originHost === host || originHost === siteHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let input;
  try {
    input = bookingRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Please check the booking details.",
          fields: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const age = Date.now() - input.startedAt;
  if (age < 2500) {
    return NextResponse.json(
      { error: "Please take a moment and try again." },
      { status: 400 },
    );
  }
  if (age > 2 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "This booking session has expired. Please reload the page." },
      { status: 400 },
    );
  }

  const ip = getIpFromHeaders(request.headers);
  const ipHash = hashIp(ip);

  if (ipHash) {
    try {
      const recent = await countRecentBookingsByIp(ipHash);
      if (recent >= 5) {
        return NextResponse.json(
          {
            error: "Too many booking attempts. Please call the salon.",
          },
          { status: 429 },
        );
      }

      const activePending = await countActivePendingBookingsByIp(ipHash);
      if (activePending >= 2) {
        return NextResponse.json(
          {
            error:
              "You already have an appointment payment in progress. Please complete it or call the salon.",
          },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error("Booking rate limit check failed", error);
    }
  }

  const terms = await getPage("terms");
  const termsVersion = terms.content.version.trim();
  if (!termsVersion) {
    return NextResponse.json(
      { error: "The booking terms are not configured. Please call the salon." },
      { status: 503 },
    );
  }

  try {
    const booking = await createBooking(input, ipHash, termsVersion);

    const settings = await getSettingsForAdmin();

    if (booking.paymentStatus === "pending") {
      let sessionId: string | null = null;
      try {
        const session = await createDepositCheckoutSession({
          booking,
          settings,
        });
        if (!session.url) {
          throw new Error("Stripe did not return a Checkout URL.");
        }
        sessionId = session.id;
        await setBookingStripeSession(booking.id, session.id);

        return NextResponse.json(
          {
            ok: true,
            requiresPayment: true,
            checkoutUrl: session.url,
            booking: {
              reference: booking.reference,
              depositCents: booking.depositCents,
            },
          },
          { status: 201 },
        );
      } catch (sessionError) {
        console.error("Stripe Checkout session creation failed", sessionError);
        if (sessionId) {
          try {
            await getStripe().checkout.sessions.expire(sessionId);
          } catch (expireError) {
            console.error("Unable to expire orphaned Checkout session", expireError);
          }
        }
        await cancelPendingBooking(booking.id);
        return NextResponse.json(
          {
            error:
              "Secure payment could not be started. Please try again or call the salon.",
          },
          { status: 502 },
        );
      }
    }

    after(async () => {
      try {
        const emailStatuses = await sendBookingEmails(booking, settings);
        await updateBookingEmailStatuses(
          booking.id,
          emailStatuses.owner,
          emailStatuses.customer,
        );
      } catch (emailError) {
        console.error("Booking saved but email notification failed", emailError);
      }
    });

    return NextResponse.json(
      {
        ok: true,
        requiresPayment: false,
        booking: {
          reference: booking.reference,
          serviceName: booking.serviceName,
          date: booking.date,
          startTime: booking.startTime.slice(0, 5),
          endTime: booking.endTime.slice(0, 5),
          durationMinutes: booking.durationMinutes,
          priceCents: booking.priceCents,
          priceType: booking.priceType,
        },
        emailStatuses: { owner: "queued", customer: "queued" },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Booking failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error &&
          error.message.includes("DATABASE_URL")
            ? "Online booking is not configured yet. Please call the salon."
            : "The booking could not be completed. Please call the salon.",
      },
      { status: 500 },
    );
  }
}
