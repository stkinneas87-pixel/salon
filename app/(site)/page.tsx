import type { Metadata } from "next";
import Link from "next/link";

import { Marquee } from "@/components/site/marquee";
import { ParallaxMedia } from "@/components/site/parallax-media";
import { PromoModal } from "@/components/site/promo-modal";
import { Reveal } from "@/components/site/reveal";
import { ServicePrice } from "@/components/site/service-price";
import { ActionLink } from "@/components/ui/action-link";
import {
  getActivePromotions,
  getPage,
  getPublicServices,
  getSettings,
} from "@/lib/content/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  formatClosedDays,
  formatDuration,
  formatHoursSummary,
} from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("home"),
    getSettings(),
  ]);
  return buildPageMetadata("home", seo, settings);
}

export default async function HomePage() {
  const [{ content }, settings, services, promotions] = await Promise.all([
    getPage("home"),
    getSettings(),
    getPublicServices(),
    getActivePromotions(),
  ]);

  const preview = services.slice(0, 3);

  return (
    <>
      <section className="grid border-b border-line lg:grid-cols-[1.03fr_0.97fr]">
        <div className="flex min-h-[calc(100svh-var(--header-height))] flex-col justify-between">
          <div className="container-editorial w-full pt-16 pb-10 lg:pt-24">
            <p className="label flex items-center gap-3 text-muted">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {content.hero.eyebrow}
            </p>
            <h1 className="display mt-8 text-[clamp(3.5rem,7.4vw,8.8rem)]">
              {content.hero.titleLines.map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={index === 1 ? "block italic" : "block"}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="pretty mt-8 max-w-md text-base leading-relaxed text-muted lg:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ActionLink href={content.hero.primaryCta.href}>
                {content.hero.primaryCta.label}
              </ActionLink>
              <ActionLink
                href={content.hero.secondaryCta.href}
                variant="outline"
                arrow={false}
              >
                {content.hero.secondaryCta.label}
              </ActionLink>
            </div>
          </div>

          <div className="container-editorial flex w-full items-end justify-between gap-6 border-t border-line py-5">
            <p className="label text-muted">
              {formatHoursSummary(settings.hours)}
            </p>
            <p className="label hidden text-muted sm:block">
              {content.hero.sideLabel}
            </p>
          </div>
        </div>

        <ParallaxMedia
          src={content.hero.image.src}
          alt={content.hero.image.alt}
          className="min-h-[62vh] lg:min-h-[calc(100svh-var(--header-height))]"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          speed={0.1}
        />
      </section>

      <Marquee words={content.marquee} />

      <section className="section">
        <div className="container-editorial grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-24">
          <Reveal>
            <p className="label text-muted">{content.intro.label}</p>
            <h2 className="display mt-6 max-w-[12ch] text-[clamp(3rem,6vw,6.5rem)]">
              {content.intro.heading}
            </h2>
            <div className="mt-8 max-w-xl space-y-5 text-base leading-relaxed text-muted lg:text-lg">
              {content.intro.paragraphs.map((paragraph) => (
                <p key={paragraph} className="pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:pt-24">
            <ParallaxMedia
              src={content.intro.image.src}
              alt={content.intro.image.alt}
              className="aspect-[4/5]"
              sizes="(min-width: 1024px) 40vw, 100vw"
              speed={-0.07}
            />
            <p className="mt-3 text-xs tracking-wide text-muted uppercase">
              {content.intro.caption}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden bg-ink text-white lg:min-h-[82vh]">
        <ParallaxMedia
          src={content.statement.image.src}
          alt={content.statement.image.alt}
          className="absolute inset-0 bg-ink"
          sizes="100vw"
          speed={0.13}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-editorial relative z-10 w-full pb-14 lg:pb-20">
          <Reveal>
            <p className="display max-w-5xl text-[clamp(2.8rem,6.8vw,7.5rem)] text-white">
              {content.statement.text}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section border-b border-line">
        <div className="container-editorial">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <p className="label text-muted">{content.servicesPreview.label}</p>
              <h2 className="display mt-6 max-w-2xl text-[clamp(3rem,5.5vw,5.8rem)]">
                {content.servicesPreview.heading}
              </h2>
            </Reveal>
            <Reveal delay={100} className="max-w-sm">
              <p className="pretty text-sm leading-relaxed text-muted lg:text-base">
                {content.servicesPreview.body}
              </p>
              <ActionLink
                href="/services"
                variant="plain"
                className="mt-6"
                arrow
              >
                {content.servicesPreview.ctaLabel}
              </ActionLink>
            </Reveal>
          </div>

          <div className="mt-14">
            {preview.length ? (
              preview.map((service, index) => (
                <Reveal
                  key={service.slug}
                  delay={index * 70}
                  className="group grid gap-4 border-t border-line py-7 lg:grid-cols-[0.45fr_1.4fr_0.65fr_auto] lg:items-center lg:gap-10"
                >
                  <p className="label text-muted">{service.category}</p>
                  <div>
                    <h3 className="font-serif text-3xl leading-none font-normal lg:text-4xl">
                      {service.name}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4 lg:flex-col lg:items-start lg:gap-1">
                    <p className="text-base tabular-nums">
                      <ServicePrice
                        priceCents={service.priceCents}
                        salePriceCents={service.salePriceCents}
                        priceType={service.priceType}
                      />
                    </p>
                    <p className="label text-muted">
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>
                  <Link
                    href={`/book?service=${service.slug}`}
                    prefetch={false}
                    className="label inline-flex items-center justify-between gap-8 border border-line px-4 py-3 transition-colors hover:bg-ink hover:text-white"
                  >
                    Book <span aria-hidden="true">↗</span>
                  </Link>
                </Reveal>
              ))
            ) : (
              <p className="border-t border-line py-8 text-sm text-muted">
                The service menu is being updated. Call{" "}
                <a
                  href={`tel:${settings.contact.phoneE164}`}
                  className="link-underline"
                >
                  {settings.contact.phoneDisplay}
                </a>{" "}
                to book.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-editorial">
          <Reveal>
            <p className="label text-muted">{content.gallery.label}</p>
            <h2 className="display mt-6 max-w-3xl text-[clamp(3rem,5.5vw,5.8rem)]">
              {content.gallery.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 lg:mt-16 lg:grid-cols-12 lg:gap-5">
            {content.gallery.images.map((image, index) => {
              const layout = [
                "col-span-2 lg:col-span-5",
                "lg:col-span-3 lg:mt-24",
                "lg:col-span-4 lg:mt-8",
                "col-span-2 lg:col-span-7 lg:col-start-4 lg:-mt-12",
              ][index % 4];
              return (
                <Reveal
                  key={`${image.src}-${index}`}
                  delay={index * 60}
                  className={layout}
                >
                  <ParallaxMedia
                    src={image.src}
                    alt={image.alt}
                    className={
                      index % 3 === 0
                        ? "aspect-[4/5]"
                        : "aspect-[3/4]"
                    }
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    speed={index % 2 === 0 ? 0.05 : -0.05}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-mist">
        <div className="container-editorial">
          <Reveal>
            <p className="label text-muted">{content.experience.label}</p>
            <h2 className="display mt-6 max-w-3xl text-[clamp(3rem,5.5vw,5.8rem)]">
              {content.experience.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-16">
            {content.experience.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <p className="label text-muted">0{index + 1}</p>
                <h3 className="mt-5 font-serif text-3xl leading-none font-normal lg:text-4xl">
                  {item.title}
                </h3>
                <p className="pretty mt-4 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          <div className="flex items-center">
            <div className="container-editorial w-full py-16 lg:py-24">
              <Reveal>
                <p className="label text-white/60">{content.location.label}</p>
                <h2 className="display mt-6 text-[clamp(3rem,5.5vw,5.8rem)] text-white">
                  {content.location.heading}
                </h2>
                <p className="pretty mt-6 max-w-md text-sm leading-relaxed text-white/55 lg:text-base">
                  {content.location.body}
                </p>
                <div className="mt-10 space-y-5 text-sm text-white/65">
                  <div>
                    <p className="label mb-2 text-white/60">Address</p>
                    <a
                      href={settings.contact.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-underline"
                    >
                      {settings.contact.addressLine1}, {settings.contact.addressLine2}
                    </a>
                  </div>
                  <div>
                    <p className="label mb-2 text-white/60">Hours</p>
                    <p>{formatHoursSummary(settings.hours)}</p>
                    {formatClosedDays(settings.hours) ? (
                      <p className="mt-1 text-white/60">
                        {formatClosedDays(settings.hours)}
                      </p>
                    ) : null}
                  </div>
                  <a
                    href={`tel:${settings.contact.phoneE164}`}
                    className="label inline-flex text-white/80 hover:text-white"
                  >
                    {settings.contact.phoneDisplay}
                  </a>
                  {settings.contact.whatsappUrl ? (
                    <a
                      href={settings.contact.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="label inline-flex text-white/80 hover:text-white"
                    >
                      WhatsApp <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
                <ActionLink
                  href="/contact"
                  variant="light"
                  className="mt-9"
                >
                  Contact & directions
                </ActionLink>
              </Reveal>
            </div>
          </div>
          <ParallaxMedia
            src={content.location.image.src}
            alt={content.location.image.alt}
            className="min-h-[52vh] lg:min-h-[76vh]"
            sizes="(min-width: 1024px) 45vw, 100vw"
            speed={-0.08}
          />
        </div>
      </section>

      <section className="section">
        <div className="container-editorial">
          <Reveal className="border-t border-line pt-12 lg:pt-16">
            <h2 className="display max-w-4xl text-[clamp(3.5rem,8vw,9rem)]">
              {content.closing.heading}
            </h2>
            <p className="pretty mt-6 max-w-md text-base leading-relaxed text-muted">
              {content.closing.body}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ActionLink href="/book">{content.closing.primaryLabel}</ActionLink>
              <ActionLink
                href={`tel:${settings.contact.phoneE164}`}
                variant="outline"
                arrow={false}
              >
                {content.closing.secondaryLabel}
              </ActionLink>
            </div>
          </Reveal>
        </div>
      </section>

      <PromoModal promos={promotions} />
    </>
  );
}
