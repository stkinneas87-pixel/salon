import type { BookingRow } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/content/schemas";
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/utils";

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function layout(settings: SiteSettings, body: string) {
  return `<!doctype html>
<html lang="en-AU">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(settings.brand.name)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f1ed;color:#0b0b0b;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ed;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e2dc;">
            <tr>
              <td style="background:#0b0b0b;padding:28px 32px;">
                <div style="color:#ffffff;font-size:13px;letter-spacing:6px;font-weight:700;">${escapeHtml(settings.brand.name.toUpperCase())}</div>
                <div style="color:#ffffff;opacity:.6;font-size:11px;letter-spacing:3px;margin-top:6px;">NEWPORT · SYDNEY</div>
              </td>
            </tr>
            <tr><td style="padding:36px 32px;">${body}</td></tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #e5e2dc;color:#6b6b6b;font-size:12px;line-height:1.6;">
                ${escapeHtml(settings.brand.name)} · ${escapeHtml(settings.contact.addressFull)}<br />
                ${escapeHtml(settings.contact.phoneDisplay)} · ${escapeHtml(settings.contact.facebookUrl)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;color:#6b6b6b;font-size:13px;width:150px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#0b0b0b;font-size:14px;line-height:1.5;">${escapeHtml(value)}</td>
  </tr>`;
}

function summaryHtml(booking: BookingRow) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-top:1px solid #e5e2dc;border-bottom:1px solid #e5e2dc;">
    ${detailRow("Reference", booking.reference)}
    ${detailRow("Service", booking.serviceName)}
    ${detailRow("Date", formatDateLong(booking.date))}
    ${detailRow("Time", `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`)}
    ${detailRow("Duration", formatDuration(booking.durationMinutes))}
    ${detailRow("Price", `${formatPrice(booking.priceCents, booking.priceType)} · pay in salon`)}
  </table>`;
}

export function ownerEmail(booking: BookingRow, settings: SiteSettings) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const body = `
    <p style="margin:0 0 8px;color:#6b6b6b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">New booking</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:30px;line-height:1.2;font-weight:400;">${escapeHtml(booking.customerName)}</h1>
    ${summaryHtml(booking)}
    <p style="margin:0 0 6px;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(booking.customerPhone)}</p>
    <p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(booking.customerEmail)}</p>
    ${booking.notes ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;"><strong>Notes:</strong><br />${escapeHtml(booking.notes)}</p>` : ""}
    ${siteUrl ? `<p style="margin:28px 0 0;"><a href="${siteUrl}/admin/bookings/${booking.id}" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;padding:12px 20px;font-size:13px;">Open in the admin</a></p>` : ""}
  `;

  return {
    subject: `New booking — ${singleLine(booking.customerName)} · ${singleLine(booking.serviceName)} · ${formatDateLong(booking.date)} ${formatTime(booking.startTime)}`,
    html: layout(settings, body),
    text: [
      "New booking",
      `Name: ${booking.customerName}`,
      `Service: ${booking.serviceName}`,
      `Date: ${formatDateLong(booking.date)}`,
      `Time: ${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
      `Phone: ${booking.customerPhone}`,
      `Email: ${booking.customerEmail}`,
      booking.notes ? `Notes: ${booking.notes}` : "",
      siteUrl ? `Admin: ${siteUrl}/admin/bookings/${booking.id}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function customerEmail(booking: BookingRow, settings: SiteSettings) {
  const body = `
    <p style="margin:0 0 8px;color:#6b6b6b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Booking confirmed</p>
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;">See you soon, ${escapeHtml(booking.customerName.split(" ")[0] || booking.customerName)}.</h1>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#3a3a3a;">${escapeHtml(settings.booking.confirmationNote)}</p>
    ${summaryHtml(booking)}
    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Where:</strong><br />${escapeHtml(settings.contact.addressFull)}</p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;"><strong>Phone:</strong> ${escapeHtml(settings.contact.phoneDisplay)}</p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b6b6b;">${escapeHtml(settings.booking.policyNote)}</p>
    <p style="margin:28px 0 0;"><a href="${escapeHtml(settings.contact.mapsUrl)}" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;padding:12px 20px;font-size:13px;">Open directions</a></p>
  `;

  return {
    subject: `Your booking at ${singleLine(settings.brand.name)} — ${formatDateLong(booking.date)}`,
    html: layout(settings, body),
    text: [
      `Booking confirmed: ${booking.reference}`,
      `${booking.serviceName}`,
      `${formatDateLong(booking.date)} at ${formatTime(booking.startTime)}`,
      `${settings.contact.addressFull}`,
      `Phone: ${settings.contact.phoneDisplay}`,
      settings.booking.policyNote,
    ].join("\n"),
  };
}
