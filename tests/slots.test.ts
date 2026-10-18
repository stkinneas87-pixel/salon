import { describe, expect, it } from "vitest";

import {
  availableSlotTimes,
  buildSlots,
  validateRequestedSlot,
} from "@/lib/booking/slots";
import { defaultSettings } from "@/lib/content/defaults";
import { formatDuration, formatPrice } from "@/lib/utils";

const wednesday = "2026-10-21";
const now = new Date("2026-10-21T05:00:00+11:00");

function settings() {
  return structuredClone(defaultSettings);
}

describe("booking slot generation", () => {
  it("returns closed for Sunday", () => {
    const result = buildSlots({
      date: "2026-10-18",
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [],
      now,
    });

    expect(result.closed).toBe(true);
    expect(result.slots).toHaveLength(0);
  });

  it("generates 30-minute starts that fit before closing", () => {
    const result = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [],
      now,
    });

    const times = availableSlotTimes(result);
    expect(times[0]).toBe("09:00");
    expect(times.at(-1)).toBe("17:00");
    expect(times).toHaveLength(17);
  });

  it("stops a three-hour service at 15:00 for an 18:00 close", () => {
    const result = buildSlots({
      date: wednesday,
      durationMinutes: 180,
      settings: settings(),
      bookings: [],
      closures: [],
      now,
    });

    expect(availableSlotTimes(result).at(-1)).toBe("15:00");
  });

  it("applies the minimum notice period on the same day", () => {
    const result = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [],
      now: new Date("2026-10-21T10:00:00+11:00"),
    });

    const times = availableSlotTimes(result);
    expect(times).not.toContain("09:00");
    expect(times).not.toContain("11:00");
    expect(times[0]).toBe("12:00");
  });

  it("applies a multi-day notice window to future dates", () => {
    const config = settings();
    config.booking.leadTimeMinutes = 1440;

    const result = buildSlots({
      date: "2026-10-22",
      durationMinutes: 60,
      settings: config,
      bookings: [],
      closures: [],
      now: new Date("2026-10-21T10:00:00+11:00"),
    });

    const times = availableSlotTimes(result);
    expect(times).not.toContain("09:00");
    expect(times).toContain("10:00");
  });

  it("allows back-to-back bookings that never exceed capacity together", () => {
    const config = settings();
    config.booking.capacity = 2;

    const result = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: config,
      bookings: [
        { startTime: "09:00", endTime: "09:30", status: "confirmed" },
        { startTime: "09:30", endTime: "10:00", status: "confirmed" },
      ],
      closures: [],
      now,
    });

    expect(availableSlotTimes(result)).toContain("09:00");
  });

  it("respects the capacity for overlapping bookings", () => {
    const config = settings();
    config.booking.capacity = 2;

    const one = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: config,
      bookings: [
        { startTime: "09:00", endTime: "10:00", status: "confirmed" },
      ],
      closures: [],
      now,
    });
    expect(availableSlotTimes(one)).toContain("09:00");

    const two = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: config,
      bookings: [
        { startTime: "09:00", endTime: "10:00", status: "confirmed" },
        { startTime: "09:30", endTime: "10:30", status: "confirmed" },
      ],
      closures: [],
      now,
    });
    expect(availableSlotTimes(two)).not.toContain("09:00");
    expect(availableSlotTimes(two)).not.toContain("09:30");
    expect(availableSlotTimes(two)).toContain("10:00");
  });

  it("ignores cancelled bookings", () => {
    const result = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: settings(),
      bookings: [
        { startTime: "09:00", endTime: "10:00", status: "cancelled" },
      ],
      closures: [],
      now,
    });

    expect(availableSlotTimes(result)).toContain("09:00");
  });

  it("blocks a partial closure and all-day closure", () => {
    const partial = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [{ startTime: "10:00", endTime: "12:00" }],
      now,
    });
    expect(availableSlotTimes(partial)).not.toContain("10:00");
    expect(availableSlotTimes(partial)).not.toContain("11:00");
    expect(availableSlotTimes(partial)).toContain("12:00");

    const allDay = buildSlots({
      date: wednesday,
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [{ startTime: null, endTime: null }],
      now,
    });
    expect(availableSlotTimes(allDay)).toHaveLength(0);
  });

  it("rejects dates outside the booking window", () => {
    const result = buildSlots({
      date: "2027-06-01",
      durationMinutes: 60,
      settings: settings(),
      bookings: [],
      closures: [],
      now,
    });

    expect(result.closed).toBe(true);
    expect(result.reason).toMatch(/window/i);
  });

  it("validates a requested slot and returns its end time", () => {
    const result = validateRequestedSlot({
      date: wednesday,
      time: "13:30",
      durationMinutes: 75,
      settings: settings(),
      bookings: [],
      closures: [],
      now,
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.endTime).toBe("14:45");
  });

  it("rejects an unavailable requested slot", () => {
    const result = validateRequestedSlot({
      date: wednesday,
      time: "09:00",
      durationMinutes: 60,
      settings: settings(),
      bookings: [
        { startTime: "09:00", endTime: "10:00", status: "confirmed" },
        { startTime: "09:00", endTime: "10:00", status: "confirmed" },
      ],
      closures: [],
      now,
    });

    expect(result.ok).toBe(false);
  });
});

describe("formatting", () => {
  it("formats fixed and from prices", () => {
    expect(formatPrice(11000, "fixed")).toBe("$110");
    expect(formatPrice(13500, "from")).toBe("from $135");
  });

  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(75)).toBe("1 hr 15 min");
  });
});
