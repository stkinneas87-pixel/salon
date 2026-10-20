import { connection, NextResponse } from "next/server";

import {
  availableSlotTimes,
  buildSlots,
  isValidDateString,
} from "@/lib/booking/slots";
import {
  getBlockingBookingsForDate,
  getClosuresForDate,
  getServiceById,
  getSettingsForAdmin,
} from "@/lib/db/queries";
import { isStripeConfigured } from "@/lib/payments/stripe";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId") ?? "";
  const date = url.searchParams.get("date") ?? "";

  try {

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Choose a service and a date." },
        { status: 400 },
      );
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        serviceId,
      )
    ) {
      return NextResponse.json(
        { error: "That service is not available." },
        { status: 400 },
      );
    }

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { error: "Choose a valid date." },
        { status: 400 },
      );
    }

    const service = await getServiceById(serviceId);
    if (!service || !service.active || service.isSample) {
      return NextResponse.json(
        { error: "That service is not available." },
        { status: 404 },
      );
    }

    const [settings, bookings, closures] = await Promise.all([
      getSettingsForAdmin(),
      getBlockingBookingsForDate(date),
      getClosuresForDate(date),
    ]);

    if (!settings.booking.enabled) {
      return NextResponse.json(
        {
          closed: true,
          reason: "Online booking is paused. Please call the salon.",
          slots: [],
          timezone: "Australia/Sydney",
        },
        { status: 200 },
      );
    }

    if (settings.payments.enabled && !isStripeConfigured()) {
      return NextResponse.json(
        {
          closed: true,
          reason: "Online payment is temporarily unavailable. Please call the salon.",
          slots: [],
          timezone: "Australia/Sydney",
        },
        { status: 200 },
      );
    }

    const result = buildSlots({
      date,
      durationMinutes: service.durationMinutes,
      settings,
      bookings,
      closures,
    });

    return NextResponse.json(
      {
        date,
        timezone: result.timezone,
        closed: result.closed,
        reason: result.reason,
        slots: availableSlotTimes(result),
        service: {
          id: service.id,
          durationMinutes: service.durationMinutes,
          priceCents: service.priceCents,
          salePriceCents: service.salePriceCents,
          priceType: service.priceType,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Availability request failed", error);
    return NextResponse.json(
      { error: "Availability could not be loaded. Please call the salon." },
      { status: 500 },
    );
  }
}
