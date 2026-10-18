import { after, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getIpFromHeaders, hashIp } from "@/lib/auth/ip";
import { BookingError, createBooking } from "@/lib/booking/create";
import { bookingRequestSchema } from "@/lib/content/schemas";
import {
  countRecentBookingsByIp,
  getSettingsForAdmin,
  updateBookingEmailStatuses,
} from "@/lib/db/queries";
import { sendBookingEmails } from "@/lib/email/send";
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
    } catch (error) {
      console.error("Booking rate limit check failed", error);
    }
  }

  try {
    const booking = await createBooking(input, ipHash);

    after(async () => {
      try {
        const settings = await getSettingsForAdmin();
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
