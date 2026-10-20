import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import type { SiteSettings } from "@/lib/content/schemas";
import type { BookingRow } from "@/lib/db/schema";
import { formatDateLong, formatDuration, formatTime } from "@/lib/utils";

import { gstComponentCents, invoiceNumberFor } from "./invoice-meta";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const RIGHT = PAGE_WIDTH - MARGIN;

const ink = rgb(0.043, 0.043, 0.043);
const muted = rgb(0.42, 0.42, 0.42);
const line = rgb(0.898, 0.886, 0.863);
const mist = rgb(0.953, 0.945, 0.929);
const paper = rgb(1, 1, 1);

export type InvoiceDocument = {
  filename: string;
  invoiceNumber: string;
  content: Uint8Array;
};

function sanitize(value: string) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .trim();
}

function amount(cents: number) {
  return (cents / 100).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function wrap(value: string, font: PDFFont, size: number, maxWidth: number) {
  const words = sanitize(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

type TextOptions = {
  x: number;
  y: number;
  size?: number;
  font: PDFFont;
  color?: ReturnType<typeof rgb>;
  maxWidth?: number;
  lineHeight?: number;
};

function drawText(page: PDFPage, value: string, options: TextOptions) {
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size + 3;
  const lines = options.maxWidth
    ? wrap(value, options.font, size, options.maxWidth)
    : [sanitize(value)];

  lines.forEach((text, index) => {
    page.drawText(text, {
      x: options.x,
      y: options.y - index * lineHeight,
      size,
      font: options.font,
      color: options.color ?? ink,
    });
  });

  return lines.length * lineHeight;
}

function drawRight(
  page: PDFPage,
  value: string,
  options: Omit<TextOptions, "x" | "maxWidth"> & {
    right?: number;
    maxWidth?: number;
  },
) {
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size + 3;
  const lines = wrap(
    value,
    options.font,
    size,
    options.maxWidth ?? RIGHT - MARGIN,
  );

  lines.forEach((text, index) => {
    const width = options.font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (options.right ?? RIGHT) - width,
      y: options.y - index * lineHeight,
      size,
      font: options.font,
      color: options.color ?? ink,
    });
  });

  return lines.length * lineHeight;
}

function divider(page: PDFPage, y: number) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: RIGHT, y },
    thickness: 0.75,
    color: line,
  });
}

function invoiceDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(value);
}

export async function createInvoicePdf(
  booking: BookingRow,
  settings: SiteSettings,
): Promise<InvoiceDocument> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const invoiceNumber = invoiceNumberFor(booking.reference);
  const paidAt = booking.paidAt ?? booking.createdAt;
  const balance = Math.max(0, booking.priceCents - booking.depositCents);
  const isFromPrice = booking.priceType === "from";
  const abn = settings.brand.abn?.trim();

  doc.setTitle(`${invoiceNumber} - ${settings.brand.name} tax invoice`);
  doc.setAuthor(settings.brand.name);
  doc.setSubject(`Tax invoice for booking ${booking.reference}`);
  doc.setCreationDate(paidAt);

  const top = PAGE_HEIGHT - MARGIN;

  drawText(page, settings.brand.name, {
    x: MARGIN,
    y: top,
    size: 20,
    font: bold,
  });

  drawText(page, settings.contact.addressLine1, {
    x: MARGIN,
    y: top - 18,
    size: 8.5,
    font: regular,
    color: muted,
    maxWidth: 260,
  });
  drawText(page, settings.contact.addressLine2, {
    x: MARGIN,
    y: top - 30,
    size: 8.5,
    font: regular,
    color: muted,
    maxWidth: 260,
  });
  drawText(
    page,
    [settings.contact.phoneDisplay, settings.contact.email]
      .filter(Boolean)
      .join("  ·  "),
    { x: MARGIN, y: top - 42, size: 8.5, font: regular, color: muted },
  );

  drawRight(page, "TAX INVOICE", {
    y: top,
    size: 14,
    font: bold,
  });
  drawRight(page, `Invoice ${invoiceNumber}`, {
    y: top - 20,
    size: 9,
    font: regular,
    color: muted,
  });
  drawRight(page, `Issued ${invoiceDate(paidAt)}`, {
    y: top - 33,
    size: 9,
    font: regular,
    color: muted,
  });

  const headerDivider = top - 58;
  divider(page, headerDivider);

  const billTop = headerDivider - 26;
  drawText(page, "BILLED TO", {
    x: MARGIN,
    y: billTop,
    size: 7.5,
    font: bold,
    color: muted,
  });
  const nameHeight = drawText(page, booking.customerName, {
    x: MARGIN,
    y: billTop - 18,
    size: 11,
    font: bold,
    maxWidth: 250,
  });
  const emailHeight = drawText(page, booking.customerEmail, {
    x: MARGIN,
    y: billTop - 18 - nameHeight,
    size: 9,
    font: regular,
    color: muted,
    maxWidth: 250,
  });
  drawText(page, booking.customerPhone, {
    x: MARGIN,
    y: billTop - 18 - nameHeight - emailHeight,
    size: 9,
    font: regular,
    color: muted,
    maxWidth: 250,
  });

  drawRight(page, "APPOINTMENT", {
    y: billTop,
    size: 7.5,
    font: bold,
    color: muted,
  });
  const appointmentNameHeight = drawRight(page, booking.serviceName, {
    y: billTop - 18,
    size: 10,
    font: bold,
    maxWidth: 250,
  });
  drawRight(page, formatDateLong(booking.date), {
    y: billTop - 18 - appointmentNameHeight - 1,
    size: 9,
    font: regular,
    color: muted,
  });
  drawRight(
    page,
    `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}  ·  ${formatDuration(booking.durationMinutes)}`,
    {
      y: billTop - 18 - appointmentNameHeight - 14,
      size: 9,
      font: regular,
      color: muted,
      maxWidth: 250,
    },
  );

  const tableTop = billTop - 78;
  divider(page, tableTop + 22);

  const headerHeight = 22;
  page.drawRectangle({
    x: MARGIN,
    y: tableTop - headerHeight,
    width: RIGHT - MARGIN,
    height: headerHeight,
    color: mist,
  });

  const headerBaseline = tableTop - 15;
  drawText(page, "DESCRIPTION", {
    x: MARGIN + 12,
    y: headerBaseline,
    size: 7.5,
    font: bold,
    color: muted,
  });
  drawText(page, "DATE", {
    x: RIGHT - 236,
    y: headerBaseline,
    size: 7.5,
    font: bold,
    color: muted,
  });
  drawRight(page, "AMOUNT (AUD)", {
    y: headerBaseline,
    size: 7.5,
    font: bold,
    color: muted,
    right: RIGHT - 12,
  });

  const rowBaseline = tableTop - headerHeight - 22;
  const rowNameHeight = drawText(page, booking.serviceName, {
    x: MARGIN + 12,
    y: rowBaseline,
    size: 10.5,
    font: bold,
    maxWidth: 220,
  });
  drawText(
    page,
    isFromPrice
      ? "Indicative price - final price confirmed in salon"
      : "Appointment service",
    {
      x: MARGIN + 12,
      y: rowBaseline - rowNameHeight,
      size: 8.5,
      font: regular,
      color: muted,
    },
  );
  drawText(page, formatDateLong(booking.date), {
    x: RIGHT - 236,
    y: rowBaseline,
    size: 9,
    font: regular,
    color: muted,
  });
  drawRight(page, amount(booking.priceCents), {
    y: rowBaseline,
    size: 10.5,
    font: regular,
    right: RIGHT - 12,
  });

  divider(page, rowBaseline - 42);

  let totalsY = rowBaseline - 68;
  const labelX = RIGHT - 240;

  const totalRows: Array<[string, string]> = [
    [
      isFromPrice ? "Service total (from)" : "Service total",
      amount(booking.priceCents),
    ],
    ["Deposit paid today", amount(booking.depositCents)],
    ["Balance payable in salon", amount(balance)],
  ];

  totalRows.forEach(([label, value]) => {
    drawText(page, label, {
      x: labelX,
      y: totalsY,
      size: 9,
      font: regular,
      color: muted,
    });
    drawRight(page, value, {
      y: totalsY,
      size: 9,
      font: regular,
      right: RIGHT,
    });
    totalsY -= 17;
  });

  totalsY -= 6;
  const boxHeight = 28;
  page.drawRectangle({
    x: labelX - 12,
    y: totalsY - 8,
    width: RIGHT - labelX + 12,
    height: boxHeight,
    color: ink,
  });
  drawText(page, "TOTAL PAID", {
    x: labelX,
    y: totalsY + 1,
    size: 8.5,
    font: bold,
    color: paper,
  });
  drawRight(page, amount(booking.depositCents), {
    y: totalsY + 1,
    size: 11,
    font: bold,
    color: paper,
    right: RIGHT - 12,
  });

  totalsY -= 30;
  drawText(page, `GST included in amount paid: AUD ${amount(gstComponentCents(booking.depositCents))}`, {
    x: labelX - 12,
    y: totalsY,
    size: 8.5,
    font: regular,
    color: muted,
  });

  const paymentTop = totalsY - 44;
  drawText(page, "PAYMENT", {
    x: MARGIN,
    y: paymentTop,
    size: 7.5,
    font: bold,
    color: muted,
  });
  drawText(page, `Card payment received ${invoiceDate(paidAt)}`, {
    x: MARGIN,
    y: paymentTop - 16,
    size: 9,
    font: regular,
    maxWidth: 460,
  });
  drawText(page, `Booking reference ${booking.reference}`, {
    x: MARGIN,
    y: paymentTop - 30,
    size: 9,
    font: regular,
    color: muted,
  });
  if (booking.stripePaymentIntentId) {
    drawText(page, `Stripe payment ${booking.stripePaymentIntentId}`, {
      x: MARGIN,
      y: paymentTop - 43,
      size: 7.5,
      font: regular,
      color: muted,
      maxWidth: 460,
    });
  }

  const notesTop = 190;
  drawText(
    page,
    "All amounts are in Australian dollars and include GST. This document is a tax invoice for the deposit paid.",
    {
      x: MARGIN,
      y: notesTop,
      size: 8.5,
      font: regular,
      color: muted,
      maxWidth: RIGHT - MARGIN,
      lineHeight: 12,
    },
  );
  if (abn) {
    drawText(page, `ABN ${abn}`, {
      x: MARGIN,
      y: notesTop - 26,
      size: 8.5,
      font: regular,
      color: muted,
    });
  }

  divider(page, 120);
  drawText(page, settings.brand.name, {
    x: MARGIN,
    y: 100,
    size: 9,
    font: bold,
  });
  drawText(
    page,
    `${settings.contact.addressFull}  ·  ${settings.contact.phoneDisplay}`,
    {
      x: MARGIN,
      y: 86,
      size: 8,
      font: regular,
      color: muted,
      maxWidth: RIGHT - MARGIN,
    },
  );
  drawRight(page, "Thank you for booking with us.", {
    y: 100,
    size: 8.5,
    font: regular,
    color: muted,
  });

  const content = await doc.save();

  return {
    filename: `tax-invoice-${booking.reference}.pdf`,
    invoiceNumber,
    content,
  };
}
