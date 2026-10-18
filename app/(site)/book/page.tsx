import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingWizard } from "@/components/book/booking-wizard";
import { ActionLink } from "@/components/ui/action-link";
import { getPage, getPublicServices, getSettings } from "@/lib/content/queries";
import { isStripeConfigured } from "@/lib/payments/stripe";

export const metadata: Metadata = {
  title: { absolute: "Book an appointment | Hair & Co" },
  description: "Book a hair appointment at Hair & Co in Newport, Sydney.",
  robots: { index: false, follow: false, nocache: true },
};

function BookingFallback() {
  return (
    <div className="container-editorial py-16">
      <div className="h-8 w-48 animate-pulse bg-mist" />
      <div className="mt-8 h-72 animate-pulse bg-mist" />
    </div>
  );
}

export default async function BookPage() {
  const [services, settings, terms] = await Promise.all([
    getPublicServices(),
    getSettings(),
    getPage("terms"),
  ]);
  const paymentsReady =
    !settings.payments.enabled || isStripeConfigured();

  return (
    <>
      <section className="border-b border-line">
        <div className="container-editorial pt-16 pb-10 lg:pt-24 lg:pb-14">
          <p className="label text-muted">Booking</p>
          <h1 className="display mt-6 max-w-3xl text-[clamp(3rem,6.5vw,7rem)]">
            Book an appointment.
          </h1>
          <p className="pretty mt-5 max-w-lg text-sm leading-relaxed text-muted lg:text-base">
            Choose a service, find a time that works and leave the rest to us.{" "}
            {settings.payments.enabled
              ? "A deposit is paid online; the balance is paid in salon."
              : "Payment is in salon."}
          </p>
        </div>
      </section>

      {settings.booking.enabled && paymentsReady ? (
        <Suspense fallback={<BookingFallback />}>
          <BookingWizard
            services={services}
            settings={{
              hours: settings.hours,
              booking: {
                maxAdvanceDays: settings.booking.maxAdvanceDays,
                policyNote: settings.booking.policyNote,
                confirmationNote: settings.booking.confirmationNote,
              },
              payments: {
                enabled: settings.payments.enabled,
                depositPercent: settings.payments.depositPercent,
                depositNote: settings.payments.depositNote,
              },
              terms: {
                version: terms.content.version,
                href: "/terms",
              },
              contact: {
                phoneDisplay: settings.contact.phoneDisplay,
                phoneE164: settings.contact.phoneE164,
                addressFull: settings.contact.addressFull,
                whatsappUrl: settings.contact.whatsappUrl,
              },
            }}
          />
        </Suspense>
      ) : (
        <div className="container-narrow py-16 lg:py-24">
          <h2 className="display text-4xl lg:text-5xl">
            {settings.booking.enabled
              ? "Online payment is temporarily unavailable."
              : "Online booking is paused."}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
            Call the salon on {settings.contact.phoneDisplay} and we&apos;ll find
            a time for you.
          </p>
          <ActionLink
            href={`tel:${settings.contact.phoneE164}`}
            className="mt-8"
          >
            Call the salon
          </ActionLink>
        </div>
      )}
    </>
  );
}
