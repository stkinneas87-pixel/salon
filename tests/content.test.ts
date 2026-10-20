import { describe, expect, it } from "vitest";

import { isValidDateString } from "@/lib/booking/slots";
import { defaultSettings } from "@/lib/content/defaults";
import { mergeDefaults } from "@/lib/content/merge";
import {
  formatClosedDays,
  formatDateRange,
  getEffectivePriceCents,
} from "@/lib/utils";

describe("content merging", () => {
  it("keeps defaults for missing settings fields", () => {
    const merged = mergeDefaults(defaultSettings, {
      booking: { capacity: 5 },
    });

    expect(merged.booking.capacity).toBe(5);
    expect(merged.booking.slotIntervalMinutes).toBe(30);
    expect(merged.contact.phoneDisplay).toBe("+61 412 601 878");
  });

  it("keeps other day defaults when one day is stored", () => {
    const merged = mergeDefaults(defaultSettings, {
      hours: {
        sunday: { closed: true, open: "09:00", close: "17:00" },
      },
    });

    expect(merged.hours.wednesday.open).toBe("09:00");
  });
});

describe("date validation", () => {
  it("accepts real dates", () => {
    expect(isValidDateString("2026-10-21")).toBe(true);
    expect(isValidDateString("2028-02-29")).toBe(true);
  });

  it("rejects impossible dates", () => {
    expect(isValidDateString("2026-02-30")).toBe(false);
    expect(isValidDateString("2027-02-29")).toBe(false);
    expect(isValidDateString("21-10-2026")).toBe(false);
  });
});

describe("service pricing", () => {
  it("uses a lower sale price and ignores missing or invalid discounts", () => {
    expect(getEffectivePriceCents(11000, 8800)).toBe(8800);
    expect(getEffectivePriceCents(11000, null)).toBe(11000);
    expect(getEffectivePriceCents(11000, 11000)).toBe(11000);
    expect(getEffectivePriceCents(11000, 12000)).toBe(11000);
  });
});

describe("promotion date ranges", () => {
  it("formats single month, multi month and multi year ranges", () => {
    expect(formatDateRange("2026-10-01", "2026-10-31")).toBe(
      "1–31 October 2026",
    );
    expect(formatDateRange("2026-10-01", "2026-11-15")).toBe(
      "1 October – 15 November 2026",
    );
    expect(formatDateRange("2026-12-20", "2027-01-05")).toBe(
      "20 December 2026 – 5 January 2027",
    );
  });

  it("formats single days and open-ended promotions", () => {
    expect(formatDateRange("2026-10-20", "2026-10-20")).toBe("20 October 2026");
    expect(formatDateRange("2026-10-20", null)).toBe("From 20 October 2026");
  });
});

describe("opening hours copy", () => {
  it("summarises closed days from settings", () => {
    expect(formatClosedDays(defaultSettings.hours)).toBe(
      "Closed Sunday, Monday and Tuesday",
    );
  });
});
