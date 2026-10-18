import type { Metadata } from "next";

import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { getPage, getSettings } from "@/lib/content/queries";
import { breadcrumbJsonLd, staticBreadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("terms"),
    getSettings(),
  ]);
  return buildPageMetadata("terms", seo, settings);
}

export default async function TermsPage() {
  const { content } = await getPage("terms");

  return (
    <>
      <section className="border-b border-line">
        <div className="container-editorial pt-24 pb-14 lg:pt-32 lg:pb-20">
          <p className="label text-muted">Legal</p>
          <h1 className="display mt-8 max-w-4xl text-[clamp(3.2rem,7vw,7.5rem)]">
            {content.title}
          </h1>
          <p className="label mt-8 text-muted">
            Version {content.version} · Effective {content.effectiveDate}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow space-y-12">
          {content.sections.map((section) => (
            <Reveal key={section.title}>
              <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="border-t border-line pt-8">
            <p className="text-sm leading-relaxed text-muted">
              {content.contactNote}
            </p>
          </Reveal>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(staticBreadcrumbs.terms)} />
    </>
  );
}
