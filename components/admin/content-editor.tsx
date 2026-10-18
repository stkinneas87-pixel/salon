"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { savePageAction } from "@/actions/content";
import type { PageSeo, PageSlug } from "@/lib/content/schemas";
import { pagePaths } from "@/lib/seo/metadata";
import { seoFields } from "@/lib/content/forms";

import { FormFields, type FormSection } from "./fields";

type Result = {
  ok?: boolean;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
};

const previewHost =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
  "your-domain.com";

export function ContentEditor({
  slug,
  label,
  initialContent,
  initialSeo,
  sections,
}: {
  slug: PageSlug;
  label: string;
  initialContent: Record<string, unknown>;
  initialSeo: PageSeo;
  sections: FormSection[];
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [seo, setSeo] = useState<PageSeo>(initialSeo);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setResult(null);
    startTransition(async () => {
      const response = await savePageAction({ slug, content, seo });
      setResult(response);
      if (response.ok) router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="sticky top-0 z-20 -mx-5 border-b border-line bg-[#f6f5f1]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 xl:-mx-14 xl:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-muted">Pages / {label}</p>
            <h1 className="mt-2 font-serif text-3xl leading-none">{label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={pagePaths[slug]}
              target="_blank"
              className="label border border-line bg-white px-4 py-3 text-muted hover:text-ink"
            >
              View page ↗
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="label bg-ink px-5 py-3 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Changes go live on the public site immediately after saving. Use the
        preview link to check the page.
      </p>

      {result?.message ? (
        <div
          role="status"
          className={`mt-5 border px-4 py-3 text-sm ${
            result.ok ? "border-line bg-white" : "border-ink/30 bg-mist"
          }`}
        >
          {result.message}
          {result.errors?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {result.errors.slice(0, 8).map((error) => (
                <li key={`${error.path}-${error.message}`}>
                  {error.path || "field"}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="admin-card p-5 sm:p-6">
            <div className="mb-5 border-b border-line pb-4">
              <h2 className="font-serif text-2xl leading-none">{section.title}</h2>
              {section.description ? (
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {section.description}
                </p>
              ) : null}
            </div>
            <FormFields
              fields={section.fields}
              value={content}
              onChange={(next) => setContent(next)}
            />
          </section>
        ))}

        <section className="admin-card p-5 sm:p-6">
          <div className="mb-5 border-b border-line pb-4">
            <h2 className="font-serif text-2xl leading-none">SEO &amp; social</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              The title, description and image used by Google and social
              platforms for this page.
            </p>
          </div>
          <FormFields
            fields={seoFields}
            value={seo}
            onChange={(next) => setSeo(next as unknown as PageSeo)}
          />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
            <span className={seo.title.length > 60 ? "text-ink" : ""}>
              Title: {seo.title.length}/60
            </span>
            <span className={seo.description.length > 160 ? "text-ink" : ""}>
              Description: {seo.description.length}/160
            </span>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="label text-muted">Search preview</p>
            <div className="mt-3 bg-white">
              <p className="text-xs text-[#4d5156]">
                {previewHost}
                {pagePaths[slug]}
              </p>
              <p className="mt-1 text-lg text-[#1a0dab]">{seo.title}</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#4d5156]">
                {seo.description}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end pb-8">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="label bg-ink px-6 py-4 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
