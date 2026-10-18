import type { Metadata } from "next";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/lib/content/queries";
import { rootMetadata } from "@/lib/seo/metadata";
import { salonJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return rootMetadata(settings);
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <a
        href="#main"
        className="label fixed top-3 left-3 z-[100] -translate-y-20 bg-ink px-4 py-3 text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header
        settings={{ brand: settings.brand, contact: settings.contact }}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <JsonLd data={[salonJsonLd(settings), websiteJsonLd(settings)]} />
    </>
  );
}
