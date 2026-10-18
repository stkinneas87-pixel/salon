import type { SiteSettings } from "@/lib/content/schemas";
import {
  addDays,
  daysBetween,
  getDayHours,
  getSydneyNowMinutes,
  getSydneyToday,
  isDayClosed,
  minutesToTime,
  timeToMinutes,
} from "@/lib/utils";

export type ExistingBooking = {
  startTime: string;
  endTime: string;
  status: string;
};

export type ExistingClosure = {
  startTime: string | null;
  endTime: string | null;
};

export type SlotCandidate = {
  time: string;
  endTime: string;
  available: boolean;
  reason?: string;
};

export type SlotResult = {
  slots: SlotCandidate[];
  closed: boolean;
  reason?: string;
  date: string;
  timezone: string;
};

type SlotInput = {
  date: string;
  durationMinutes: number;
  settings: SiteSettings;
  bookings: ExistingBooking[];
  closures: ExistingClosure[];
  now?: Date;
};

export function isValidDateString(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  return (
    value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
  );
}

export function closureOverlaps(
  start: number,
  end: number,
  closures: ExistingClosure[],
) {
  return closures.some((closure) => {
    if (!closure.startTime || !closure.endTime) return true;
    const closeStart = timeToMinutes(closure.startTime);
    const closeEnd = timeToMinutes(closure.endTime);
    return start < closeEnd && end > closeStart;
  });
}

export function peakConcurrentBookings(
  start: number,
  end: number,
  bookings: ExistingBooking[],
) {
  const events: Array<{ time: number; delta: 1 | -1 }> = [];

  for (const booking of bookings) {
    if (
      booking.status !== "confirmed" &&
      booking.status !== "pending_payment"
    ) {
      continue;
    }
    const bookingStart = timeToMinutes(booking.startTime);
    const bookingEnd = timeToMinutes(booking.endTime);
    const from = Math.max(bookingStart, start);
    const to = Math.min(bookingEnd, end);
    if (from >= to) continue;
    events.push({ time: from, delta: 1 }, { time: to, delta: -1 });
  }

  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  let current = 0;
  let peak = 0;
  for (const event of events) {
    current += event.delta;
    if (current > peak) peak = current;
  }

  return peak;
}

export function buildSlots({
  date,
  durationMinutes,
  settings,
  bookings,
  closures,
  now = new Date(),
}: SlotInput): SlotResult {
  const timezone = "Australia/Sydney";

  if (!isValidDateString(date)) {
    return { slots: [], closed: true, reason: "Choose a valid date.", date, timezone };
  }

  const today = getSydneyToday(now);
  const offset = daysBetween(today, date);

  if (offset < 0) {
    return {
      slots: [],
      closed: true,
      reason: "That date has already passed.",
      date,
      timezone,
    };
  }

  if (offset > settings.booking.maxAdvanceDays) {
    return {
      slots: [],
      closed: true,
      reason: "That date is outside the booking window.",
      date,
      timezone,
    };
  }

  const day = getDayHours(settings.hours, date);
  if (isDayClosed(day)) {
    return {
      slots: [],
      closed: true,
      reason: "The salon is closed on this day.",
      date,
      timezone,
    };
  }

  const open = timeToMinutes(day.open);
  const close = timeToMinutes(day.close);
  const interval = settings.booking.slotIntervalMinutes;
  const capacity = Math.max(1, settings.booking.capacity);
  const nowMinutes = getSydneyNowMinutes(now);
  const leadTotal = nowMinutes + settings.booking.leadTimeMinutes;
  const leadUntilDate = addDays(today, Math.floor(leadTotal / 1440));
  const leadUntilMinutes = leadTotal % 1440;

  const slots: SlotCandidate[] = [];

  for (let start = open; start + durationMinutes <= close; start += interval) {
    const end = start + durationMinutes;
    const time = minutesToTime(start);
    const endTime = minutesToTime(end);
    let reason: string | undefined;

    if (
      date < leadUntilDate ||
      (date === leadUntilDate && start < leadUntilMinutes)
    ) {
      reason = "Too soon to book";
    } else if (closureOverlaps(start, end, closures)) {
      reason = "Salon closed";
    } else if (peakConcurrentBookings(start, end, bookings) >= capacity) {
      reason = "Fully booked";
    }

    slots.push({ time, endTime, available: !reason, reason });
  }

  if (slots.length === 0) {
    return {
      slots,
      closed: true,
      reason: "There are no appointment times left for this service on this day.",
      date,
      timezone,
    };
  }

  return { slots, closed: false, date, timezone };
}

export function availableSlotTimes(result: SlotResult) {
  return result.slots.filter((slot) => slot.available).map((slot) => slot.time);
}

export function validateRequestedSlot({
  date,
  time,
  durationMinutes,
  settings,
  bookings,
  closures,
  now = new Date(),
}: SlotInput & { time: string }) {
  const result = buildSlots({
    date,
    durationMinutes,
    settings,
    bookings,
    closures,
    now,
  });

  if (result.closed) return { ok: false as const, reason: result.reason ?? "Unavailable" };

  const slot = result.slots.find((candidate) => candidate.time === time);
  if (!slot) {
    return {
      ok: false as const,
      reason: "That time does not fit the service duration or opening hours.",
    };
  }

  if (!slot.available) {
    return { ok: false as const, reason: slot.reason ?? "That time is unavailable." };
  }

  return { ok: true as const, endTime: slot.endTime, slot };
}
