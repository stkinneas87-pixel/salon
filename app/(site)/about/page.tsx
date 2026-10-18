import type { Metadata } from "next";

import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { ParallaxMedia } from "@/components/site/parallax-media";
import { Reveal } from "@/components/site/reveal";
import { ActionLink } from "@/components/ui/action-link";
import { getPage, getSettings } from "@/lib/content/queries";
import { breadcrumbJsonLd, staticBreadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("about"),
    getSettings(),
  ]);
  return buildPageMetadata("about", seo, settings);
}

export default async function AboutPage() {
  const [{ content }, settings] = await Promise.all([
    getPage("about"),
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

      <section className="section">
        <div className="container-editorial grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <Reveal>
            <p className="label text-muted">{content.story.label}</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display max-w-3xl text-[clamp(2.8rem,5.5vw,5.8rem)]">
              {content.story.heading}
            </h2>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-muted lg:text-lg">
              {content.story.paragraphs.map((paragraph) => (
                <p key={paragraph} className="pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section border-y border-line bg-mist">
        <div className="container-editorial">
          <Reveal>
            <p className="label text-muted">{content.values.label}</p>
            <h2 className="display mt-6 max-w-3xl text-[clamp(2.8rem,5.5vw,5.8rem)]">
              {content.values.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-3 lg:gap-16">
            {content.values.items.map((item, index) => (
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

      <section className="section">
        <div className="container-editorial grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
          <Reveal className="lg:order-2">
            <p className="label text-muted">{content.space.label}</p>
            <h2 className="display mt-6 max-w-[12ch] text-[clamp(2.8rem,5.5vw,5.8rem)]">
              {content.space.heading}
            </h2>
            <p className="pretty mt-8 max-w-lg text-base leading-relaxed text-muted lg:text-lg">
              {content.space.body}
            </p>
          </Reveal>
          <Reveal delay={100} className="lg:order-1">
            <ParallaxMedia
              src={content.space.image.src}
              alt={content.space.image.alt}
              className="aspect-[4/5]"
              sizes="(min-width: 1024px) 45vw, 100vw"
              speed={0.07}
            />
          </Reveal>
        </div>
      </section>

      <section className="section border-t border-line">
        <div className="container-editorial">
          <Reveal>
            <p className="label text-muted">{content.gallery.label}</p>
            <h2 className="display mt-6 text-[clamp(2.8rem,5.5vw,5.8rem)]">
              {content.gallery.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-5">
            {content.gallery.images.map((image, index) => {
              const layout = [
                "col-span-2 lg:col-span-7",
                "lg:col-span-4 lg:col-start-9 lg:mt-28",
                "lg:col-span-4 lg:mt-[-4rem]",
                "lg:col-span-5 lg:col-start-6 lg:mt-16",
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
                    className={index % 2 === 0 ? "aspect-[4/5]" : "aspect-square"}
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    speed={index % 2 === 0 ? -0.05 : 0.05}
                  />
                </Reveal>
              );
            })}
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

      <JsonLd data={breadcrumbJsonLd(staticBreadcrumbs.about)} />
    </>
  );
}
