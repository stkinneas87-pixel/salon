import type { Metadata } from "next";

import { JsonLd } from "@/components/site/json-ld";
import { Reveal } from "@/components/site/reveal";
import { ActionLink } from "@/components/ui/action-link";
import { getPage, getSettings } from "@/lib/content/queries";
import { breadcrumbJsonLd, staticBreadcrumbs } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, settings] = await Promise.all([
    getPage("privacy"),
    getSettings(),
  ]);
  return buildPageMetadata("privacy", seo, settings);
}

export default async function PrivacyPage() {
  const { content } = await getPage("privacy");

  return (
    <>
      <section className="border-b border-line">
        <div className="container-editorial pt-24 pb-14 lg:pt-32 lg:pb-20">
          <p className="label text-muted">Legal</p>
          <h1 className="display mt-8 max-w-3xl text-[clamp(3.4rem,7.5vw,8rem)]">
            {content.title}
          </h1>
          <p className="label mt-8 text-muted">Last updated {content.updated}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <div className="space-y-6 text-base leading-relaxed text-muted">
            {content.paragraphs.map((paragraph) => (
              <Reveal key={paragraph}>
                <p className="pretty">{paragraph}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 border-t border-line pt-8">
            <p className="text-sm leading-relaxed text-muted">
              {content.contactNote}
            </p>
            <ActionLink href="/contact" variant="plain" className="mt-6">
              Contact Hair &amp; Co
            </ActionLink>
          </Reveal>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(staticBreadcrumbs.privacy)} />
    </>
  );
}
