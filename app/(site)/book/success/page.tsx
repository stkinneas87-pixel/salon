import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  getBookingByStripeSessionId,
  getSettingsForAdmin,
} from "@/lib/db/queries";
import {
  markCheckoutSessionPaid,
  sendPaidBookingEmails,
} from "@/lib/payments/fulfill";
import { getStripe } from "@/lib/payments/stripe";
import {
  calculateBalanceCents,
} from "@/lib/payments/deposit";
import {
  formatDateLong,
  formatPrice,
  formatTime,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Booking payment | Hair & Co" },
  robots: { index: false, follow: false, nocache: true },
};

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="container-narrow py-24">
          <p className="label text-muted">Checking payment…</p>
        </div>
      }
    >
      <Loader searchParams={searchParams} />
    </Suspense>
  );
}

async function Loader({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await connection();
  const { session_id: sessionId } = await searchParams;
  const settings = await getSettingsForAdmin();

  if (!sessionId) {
    return <PaymentMessage settings={settings} title="Payment not found." />;
  }

  let booking = await getBookingByStripeSessionId(sessionId);

  if (booking && booking.paymentStatus !== "paid") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        const result = await markCheckoutSessionPaid(session);
        if (result.booking && result.sendEmails) {
          await sendPaidBookingEmails(result.booking);
        }
        booking = (await getBookingByStripeSessionId(sessionId)) ?? booking;
      }
    } catch (error) {
      console.error("Unable to reconcile payment success page", error);
    }
  }

  if (!booking) {
    return <PaymentMessage settings={settings} title="Payment not found." />;
  }

  if (booking.paymentStatus !== "paid") {
    return (
      <PaymentMessage
        settings={settings}
        title="Payment is being processed."
        body="Stripe has not confirmed the payment yet. Refresh this page in a moment, or call the salon if it does not update."
      />
    );
  }

  if (booking.status === "cancelled" || booking.status === "no_show") {
    return (
      <PaymentMessage
        settings={settings}
        title="Payment received, but the appointment is no longer available."
        body="Please call the salon so we can resolve this and arrange a refund if needed."
      />
    );
  }

  const balance = calculateBalanceCents(booking.priceCents, booking.depositCents);

  return (
    <div className="container-narrow py-16 lg:py-24">
      <p className="label text-muted">Payment received</p>
      <h1 className="display mt-6 text-[clamp(3rem,6vw,5.5rem)]">
        See you soon.
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
        Your deposit has been paid and your appointment is confirmed.
      </p>

      <dl className="mt-10 border-t border-line">
        {[
          ["Reference", booking.reference],
          ["Service", booking.serviceName],
          ["Date", formatDateLong(booking.date)],
          [
            "Time",
            `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
          ],
          ["Deposit paid", formatPrice(booking.depositCents, "fixed")],
          ["Balance in salon", formatPrice(balance, "fixed")],
          ["Where", settings.contact.addressFull],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-4 text-sm"
          >
            <dt className="label pt-1 text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
        {booking.customerEmailStatus === "sent" ? (
          <>
            A tax invoice has been emailed to{" "}
            <strong className="font-medium text-ink">
              {booking.customerEmail}
            </strong>
            . If it does not arrive, check your spam folder or call the salon and
            we will send another copy.
          </>
        ) : (
          <>
            Ask the salon for a copy of your tax invoice if it does not arrive by
            email.
          </>
        )}
      </p>

      <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
        {settings.booking.policyNote}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`tel:${settings.contact.phoneE164}`}
          className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white hover:bg-black"
        >
          Call {settings.contact.phoneDisplay}
        </a>
        {settings.contact.whatsappUrl ? (
          <a
            href={settings.contact.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="label inline-flex items-center justify-between gap-8 border border-line px-5 py-4 hover:bg-ink hover:text-white"
          >
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        <Link
          href="/"
          className="label inline-flex items-center px-2 py-4 text-muted hover:text-ink"
        >
          Back to Hair &amp; Co
        </Link>
      </div>
    </div>
  );
}

function PaymentMessage({
  settings,
  title,
  body,
}: {
  settings: Awaited<ReturnType<typeof getSettingsForAdmin>>;
  title: string;
  body?: string;
}) {
  return (
    <div className="container-narrow py-16 lg:py-24">
      <p className="label text-muted">Booking payment</p>
      <h1 className="display mt-6 max-w-3xl text-[clamp(2.8rem,6vw,5.5rem)]">
        {title}
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
        {body || "Please call the salon and we'll help you sort it out."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`tel:${settings.contact.phoneE164}`}
          className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white hover:bg-black"
        >
          Call {settings.contact.phoneDisplay}
        </a>
        {settings.contact.whatsappUrl ? (
          <a
            href={settings.contact.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="label inline-flex items-center justify-between gap-8 border border-line px-5 py-4 hover:bg-ink hover:text-white"
          >
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="link-underline">
          Back to the website
        </Link>
      </p>
    </div>
  );
}
