import { describe, expect, it } from "vitest";

import {
  calculateBalanceCents,
  calculateDepositCents,
} from "@/lib/payments/deposit";
import { buildSlots, availableSlotTimes } from "@/lib/booking/slots";
import { defaultSettings } from "@/lib/content/defaults";

describe("deposit calculation", () => {
  it("calculates 20% rounded to the nearest dollar", () => {
    expect(calculateDepositCents(11000, 20)).toBe(2200);
    expect(calculateDepositCents(13500, 20)).toBe(2700);
    expect(calculateDepositCents(5500, 20)).toBe(1100);
  });

  it("rounds to the nearest dollar", () => {
    expect(calculateDepositCents(5550, 20)).toBe(1100);
    expect(calculateDepositCents(5600, 20)).toBe(1100);
  });

  it("enforces the minimum and caps at the service price", () => {
    expect(calculateDepositCents(300, 20)).toBe(100);
    expect(calculateDepositCents(5000, 100)).toBe(5000);
    expect(calculateDepositCents(0, 20)).toBe(0);
  });

  it("calculates the balance due", () => {
    expect(calculateBalanceCents(11000, 2200)).toBe(8800);
    expect(calculateBalanceCents(5000, 5000)).toBe(0);
  });
});

describe("pending payment slots", () => {
  it("counts an unexpired pending payment as a slot hold", () => {
    const settings = structuredClone(defaultSettings);
    settings.booking.capacity = 1;

    const result = buildSlots({
      date: "2026-10-21",
      durationMinutes: 60,
      settings,
      bookings: [
        {
          startTime: "09:00",
          endTime: "10:00",
          status: "pending_payment",
        },
      ],
      closures: [],
      now: new Date("2026-10-21T05:00:00+11:00"),
    });

    expect(availableSlotTimes(result)).not.toContain("09:00");
    expect(availableSlotTimes(result)).toContain("10:00");
  });
});
