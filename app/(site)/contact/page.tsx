import type { Metadata } from "next";

import { HoursTable } from "@/components/site/hours-table";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { ParallaxMedia } from "@/components/site/parallax-media";
import { Reveal } from "@/components/site/reveal";
import { ActionLink } from "@/components/ui/action-link";
import { getPage, getSettings } from "@/lib/content/queries";
import { breadcrumbJsonLd, staticBreadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatClosedDays } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("contact"),
    getSettings(),
  ]);
  return buildPageMetadata("contact", seo, settings);
}

export default async function ContactPage() {
  const [{ content }, settings] = await Promise.all([
    getPage("contact"),
    getSettings(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        image={content.hero.image}
      />

      <section className="section border-b border-line">
        <div className="container-editorial">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label text-muted">Contact</p>
              <h2 className="display mt-5 text-[clamp(2.8rem,5.5vw,5.8rem)]">
                {content.details.heading}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {content.details.note}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <Reveal className="bg-white p-6 lg:p-8">
              <p className="label text-muted">Call</p>
              <a
                href={`tel:${settings.contact.phoneE164}`}
                className="mt-5 block font-serif text-2xl leading-tight hover:opacity-60 lg:text-3xl"
              >
                {settings.contact.phoneDisplay}
              </a>
              {settings.contact.email ? (
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="mt-3 block break-all text-sm text-muted link-underline"
                >
                  {settings.contact.email}
                </a>
              ) : null}
              {settings.contact.whatsappUrl ? (
                <a
                  href={settings.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm text-muted link-underline hover:text-ink"
                >
                  Message on WhatsApp <span className="ml-1" aria-hidden="true">↗</span>
                </a>
              ) : null}
            </Reveal>
            <Reveal delay={60} className="bg-white p-6 lg:p-8">
              <p className="label text-muted">Visit</p>
              <a
                href={settings.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block font-serif text-2xl leading-tight hover:opacity-60 lg:text-3xl"
              >
                {settings.contact.addressLine1}
                <br />
                {settings.contact.addressLine2}
              </a>
            </Reveal>
            <Reveal delay={120} className="bg-white p-6 lg:p-8">
              <p className="label text-muted">Book</p>
              <ActionLink
                href="/book"
                variant="plain"
                className="mt-5 text-sm"
              >
                Book an appointment
              </ActionLink>
              <p className="mt-4 text-sm text-muted">
                Choose a service and time online.
              </p>
            </Reveal>
            <Reveal delay={180} className="bg-white p-6 lg:p-8">
              <p className="label text-muted">Follow</p>
              <a
                href={settings.contact.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block font-serif text-2xl leading-tight hover:opacity-60 lg:text-3xl"
              >
                Facebook <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="container-editorial grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24 lg:py-24">
          <Reveal>
            <p className="label text-white/60">Hours</p>
            <h2 className="display mt-6 text-[clamp(2.8rem,5.5vw,5.8rem)] text-white">
              {content.hours.heading}
            </h2>
            {formatClosedDays(settings.hours) ? (
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
                {formatClosedDays(settings.hours)}
              </p>
            ) : null}
          </Reveal>
          <Reveal delay={100} className="lg:pt-3">
            <HoursTable hours={settings.hours} light />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <ParallaxMedia
            src={content.location.image.src}
            alt={content.location.image.alt}
            className="min-h-[52vh] lg:min-h-[70vh]"
            sizes="(min-width: 1024px) 55vw, 100vw"
            speed={0.08}
          />
          <div className="flex items-center">
            <div className="container-editorial w-full py-16 lg:py-24">
              <Reveal>
                <p className="label text-muted">Location</p>
                <h2 className="display mt-6 max-w-md text-[clamp(2.6rem,5vw,5.2rem)]">
                  {content.location.heading}
                </h2>
                <p className="pretty mt-6 max-w-md text-base leading-relaxed text-muted">
                  {content.location.body}
                </p>
                <ActionLink
                  href={settings.contact.mapsUrl}
                  variant="outline"
                  external
                  className="mt-9"
                >
                  Open in Google Maps
                </ActionLink>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-editorial">
          <Reveal className="border-t border-line pt-12 lg:pt-16">
            <h2 className="display max-w-4xl text-[clamp(3rem,7vw,7.5rem)]">
              {content.closing.heading}
            </h2>
            <p className="pretty mt-6 max-w-md text-base leading-relaxed text-muted">
              {content.closing.body}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ActionLink href="/book">{content.closing.primaryLabel}</ActionLink>
              <ActionLink
                href={`tel:${settings.contact.phoneE164}`}
                variant="outline"
                arrow={false}
              >
                {settings.contact.phoneDisplay}
              </ActionLink>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(staticBreadcrumbs.contact)} />
    </>
  );
}
