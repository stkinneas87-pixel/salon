import { describe, expect, it } from "vitest";

import { defaultSettings } from "@/lib/content/defaults";
import type { BookingRow } from "@/lib/db/schema";
import { createInvoicePdf } from "@/lib/payments/invoice";

function paidBooking(overrides: Partial<BookingRow> = {}): BookingRow {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    reference: "HC-ABC123",
    serviceId: "00000000-0000-4000-8000-000000000001",
    serviceName: "Cut & Finish",
    priceCents: 11000,
    priceType: "fixed",
    durationMinutes: 60,
    date: "2026-10-24",
    startTime: "09:00:00",
    endTime: "10:00:00",
    customerName: "Alex Morgan",
    customerEmail: "alex@example.com",
    customerPhone: "+61 400 000 000",
    notes: "",
    internalNotes: "",
    consentAt: new Date("2026-10-20T00:00:00Z"),
    termsAcceptedAt: new Date("2026-10-20T00:00:00Z"),
    termsVersion: "1.0",
    depositCents: 2200,
    paymentStatus: "paid",
    stripeSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_test_123",
    paymentExpiresAt: null,
    paidAt: new Date("2026-10-20T00:00:00Z"),
    refundedAt: null,
    refundId: null,
    refundedBy: null,
    status: "confirmed",
    ownerEmailStatus: "sent",
    customerEmailStatus: "sent",
    ipHash: null,
    createdAt: new Date("2026-10-20T00:00:00Z"),
    updatedAt: new Date("2026-10-20T00:00:00Z"),
    ...overrides,
  };
}

describe("tax invoice PDF", () => {
  it("renders a PDF for a paid booking", async () => {
    const invoice = await createInvoicePdf(paidBooking(), defaultSettings);
    const buffer = Buffer.from(invoice.content);

    expect(invoice.filename).toBe("tax-invoice-HC-ABC123.pdf");
    expect(invoice.invoiceNumber).toBe("INV-HC-ABC123");
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(2000);
  });

  it("renders from-priced and unlimited-length names without failing", async () => {
    const invoice = await createInvoicePdf(
      paidBooking({
        priceType: "from",
        serviceName:
          "Signature Colour Correction with Bond Building Treatment and Styling",
        customerName: "Alexandra Wilhelmina Morgan-Smith",
      }),
      defaultSettings,
    );

    expect(invoice.content.length).toBeGreaterThan(2000);
  });
});
