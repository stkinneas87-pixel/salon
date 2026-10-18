import type { Metadata } from "next";

import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ServiceCard } from "@/components/site/service-card";
import { ActionLink } from "@/components/ui/action-link";
import {
  getPage,
  getPublicServices,
  getSettings,
} from "@/lib/content/queries";
import {
  breadcrumbJsonLd,
  servicesJsonLd,
  staticBreadcrumbs,
} from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { slugify } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("services"),
    getSettings(),
  ]);
  return buildPageMetadata("services", seo, settings);
}

export default async function ServicesPage() {
  const [{ content }, settings, services] = await Promise.all([
    getPage("services"),
    getSettings(),
    getPublicServices(),
  ]);

  const groups = new Map<string, typeof services>();
  for (const service of services) {
    const group = groups.get(service.category) ?? [];
    group.push(service);
    groups.set(service.category, group);
  }

  return (
    <>
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        image={content.hero.image}
      />

      <section className="section-tight border-b border-line">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
          <Reveal>
            <p className="label text-muted">{content.intro.label}</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display max-w-3xl text-[clamp(2.6rem,5vw,5.2rem)]">
              {content.intro.heading}
            </h2>
            <div className="mt-7 max-w-2xl space-y-4 text-sm leading-relaxed text-muted lg:text-base">
              {content.intro.paragraphs.map((paragraph) => (
                <p key={paragraph} className="pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {groups.size ? (
        <div className="sticky top-[var(--header-height)] z-30 border-b border-line bg-white/95 backdrop-blur-md">
          <nav
            className="container-editorial flex items-center gap-6 overflow-x-auto py-4"
            aria-label="Service categories"
          >
            {Array.from(groups.keys()).map((category, index) => (
              <a
                key={category}
                href={`#${slugify(category)}`}
                className="label shrink-0 text-muted transition-colors hover:text-ink"
              >
                <span className="mr-2 text-[9px] text-muted/60">
                  0{index + 1}
                </span>
                {category}
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      <section className="section" id="menu">
        <div className="container-editorial">
          <Reveal className="flex flex-col gap-6 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label text-muted">{content.menu.label}</p>
              <h2 className="display mt-5 text-[clamp(2.8rem,5.5vw,5.8rem)]">
                {content.menu.heading}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              {content.menu.note}
            </p>
          </Reveal>

          {groups.size ? (
            Array.from(groups.entries()).map(([category, items]) => (
              <div
                key={category}
                id={slugify(category)}
                className="scroll-mt-32 pt-14 lg:pt-20"
              >
                <Reveal>
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-4xl leading-none font-normal lg:text-5xl">
                      {category}
                    </h3>
                    <span className="label text-muted">
                      {String(items.length).padStart(2, "0")} services
                    </span>
                  </div>
                </Reveal>
                <div>
                  {items.map((service, index) => (
                    <ServiceCard
                      key={service.slug}
                      service={service}
                      index={index}
                      showCategory={false}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="mt-14 border-t border-line pt-8">
              <p className="text-base text-muted">
                Our service menu is being updated. Call the salon on{" "}
                <a
                  href={`tel:${settings.contact.phoneE164}`}
                  className="link-underline text-ink"
                >
                  {settings.contact.phoneDisplay}
                </a>{" "}
                and we&apos;ll help you book.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-editorial grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal>
            <p className="label text-muted">Booking</p>
            <h2 className="display mt-6 text-[clamp(2.8rem,5.5vw,5.8rem)]">
              {content.booking.heading}
            </h2>
          </Reveal>
          <Reveal delay={100} className="lg:pt-14">
            <p className="pretty max-w-xl text-base leading-relaxed text-muted lg:text-lg">
              {content.booking.body}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
              {settings.booking.policyNote}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink href="/book">Book an appointment</ActionLink>
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

      <section className="section">
        <div className="container-editorial">
          <Reveal className="border-t border-line pt-12 lg:pt-16">
            <h2 className="display max-w-4xl text-[clamp(3rem,7vw,7.5rem)]">
              {content.closing.heading}
            </h2>
            <p className="pretty mt-6 max-w-md text-base leading-relaxed text-muted">
              {content.closing.body}
            </p>
            <ActionLink
              href={`tel:${settings.contact.phoneE164}`}
              className="mt-9"
            >
              {content.closing.primaryLabel}
            </ActionLink>
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={[
          servicesJsonLd(services, settings),
          breadcrumbJsonLd(staticBreadcrumbs.services),
        ]}
      />
    </>
  );
}
