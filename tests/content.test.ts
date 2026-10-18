import { describe, expect, it } from "vitest";

import { isValidDateString } from "@/lib/booking/slots";
import { defaultSettings } from "@/lib/content/defaults";
import { mergeDefaults } from "@/lib/content/merge";
import { formatClosedDays } from "@/lib/utils";

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

describe("opening hours copy", () => {
  it("summarises closed days from settings", () => {
    expect(formatClosedDays(defaultSettings.hours)).toBe(
      "Closed Sunday, Monday and Tuesday",
    );
  });
});
