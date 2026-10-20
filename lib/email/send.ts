import "server-only";

import { Resend } from "resend";

import type { SiteSettings } from "@/lib/content/schemas";
import type { BookingRow } from "@/lib/db/schema";
import { createInvoicePdf } from "@/lib/payments/invoice";

import { customerEmail, ownerEmail } from "./templates";

export type EmailResult = "sent" | "failed" | "skipped";

type EmailAttachment = {
  filename: string;
  content: string;
  contentType: string;
};

function fromAddress() {
  return process.env.BOOKING_FROM_EMAIL?.trim() || "";
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && fromAddress());
}

async function paidInvoiceAttachments(
  booking: BookingRow,
  settings: SiteSettings,
): Promise<EmailAttachment[] | undefined> {
  if (booking.paymentStatus !== "paid") return undefined;

  try {
    const invoice = await createInvoicePdf(booking, settings);
    return [
      {
        filename: invoice.filename,
        content: Buffer.from(invoice.content).toString("base64"),
        contentType: "application/pdf",
      },
    ];
  } catch (error) {
    console.error("Tax invoice generation failed", error);
    return undefined;
  }
}

async function send({
  to,
  replyTo,
  subject,
  html,
  text,
  attachments,
}: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
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
      attachments,
    });

    if (error) {
      console.error(
        "Resend email failed",
        error.name,
        error.message,
        attachments?.length ? "with attachments" : "without attachments",
      );
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
  const attachments = await paidInvoiceAttachments(booking, settings);
  const customer = customerEmail(booking, settings, {
    invoiceAttached: Boolean(attachments),
  });

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
      attachments,
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
  const attachments = await paidInvoiceAttachments(booking, settings);
  const message = customerEmail(booking, settings, {
    invoiceAttached: Boolean(attachments),
  });
  return send({
    to: booking.customerEmail,
    replyTo: ownerTo || undefined,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments,
  });
}
