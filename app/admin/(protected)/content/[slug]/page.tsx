import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ContentEditor } from "@/components/admin/content-editor";
import { defaultPages } from "@/lib/content/defaults";
import { pageFormSections } from "@/lib/content/forms";
import { mergeDefaults } from "@/lib/content/merge";
import {
  pageContentSchemas,
  pageSeoSchema,
  pageSlugs,
  type PageSlug,
} from "@/lib/content/schemas";
import { getPageRowForAdmin } from "@/lib/db/queries";

const labels: Record<PageSlug, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
  privacy: "Privacy",
};

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  return (
    <Suspense fallback={<p className="label text-muted">Loading page…</p>}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!pageSlugs.includes(slug as PageSlug)) notFound();
  const pageSlug = slug as PageSlug;

  const row = await getPageRowForAdmin(pageSlug);
  const fallback = defaultPages[pageSlug];

  const content = pageContentSchemas[pageSlug].parse(
    mergeDefaults(fallback.content, row?.content),
  );
  const seo = pageSeoSchema.parse(mergeDefaults(fallback.seo, row?.seo));

  return (
    <ContentEditor
      slug={pageSlug}
      label={labels[pageSlug]}
      initialContent={content as unknown as Record<string, unknown>}
      initialSeo={seo}
      sections={pageFormSections[pageSlug]}
    />
  );
}
