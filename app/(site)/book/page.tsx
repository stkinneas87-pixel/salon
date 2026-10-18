import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingWizard } from "@/components/book/booking-wizard";
import { ActionLink } from "@/components/ui/action-link";
import { getPublicServices, getSettings } from "@/lib/content/queries";

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
  const [services, settings] = await Promise.all([
    getPublicServices(),
    getSettings(),
  ]);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-editorial pt-16 pb-10 lg:pt-24 lg:pb-14">
          <p className="label text-muted">Booking</p>
          <h1 className="display mt-6 max-w-3xl text-[clamp(3rem,6.5vw,7rem)]">
            Book an appointment.
          </h1>
          <p className="pretty mt-5 max-w-lg text-sm leading-relaxed text-muted lg:text-base">
            Choose a service, find a time that works and leave the rest to us.
            Payment is in salon.
          </p>
        </div>
      </section>

      {settings.booking.enabled ? (
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
            Online booking is paused.
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
