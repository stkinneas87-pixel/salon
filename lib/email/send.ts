import "server-only";

import { Resend } from "resend";

import type { SiteSettings } from "@/lib/content/schemas";
import type { BookingRow } from "@/lib/db/schema";

import { customerEmail, ownerEmail } from "./templates";

export type EmailResult = "sent" | "failed" | "skipped";

function fromAddress() {
  return process.env.BOOKING_FROM_EMAIL?.trim() || "";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && fromAddress());
}

async function send({
  to,
  replyTo,
  subject,
  html,
  text,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured() || !to) return "skipped";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      replyTo,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend email failed", error.name);
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("Resend email failed", error instanceof Error ? error.message : "unknown");
    return "failed";
  }
}

export async function sendBookingEmails(
  booking: BookingRow,
  settings: SiteSettings,
) {
  const ownerTo =
    settings.booking.notifyEmail.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "";

  const owner = ownerEmail(booking, settings);
  const customer = customerEmail(booking, settings);

  const [ownerStatus, customerStatus] = await Promise.all([
    ownerTo
      ? send({
          to: ownerTo,
          replyTo: booking.customerEmail,
          subject: owner.subject,
          html: owner.html,
          text: owner.text,
        })
      : Promise.resolve<EmailResult>("skipped"),
    send({
      to: booking.customerEmail,
      replyTo: ownerTo || undefined,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    }),
  ]);

  return { owner: ownerStatus, customer: customerStatus };
}

export async function resendOwnerEmail(
  booking: BookingRow,
  settings: SiteSettings,
): Promise<EmailResult> {
  const ownerTo =
    settings.booking.notifyEmail.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "";
  if (!ownerTo) return "skipped";
  const message = ownerEmail(booking, settings);
  return send({
    to: ownerTo,
    replyTo: booking.customerEmail,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

export async function resendCustomerEmail(
  booking: BookingRow,
  settings: SiteSettings,
): Promise<EmailResult> {
  const ownerTo =
    settings.booking.notifyEmail.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "";
  const message = customerEmail(booking, settings);
  return send({
    to: booking.customerEmail,
    replyTo: ownerTo || undefined,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}
