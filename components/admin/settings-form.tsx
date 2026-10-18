"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveSettingsAction } from "@/actions/settings";
import { settingsFormSections } from "@/lib/content/forms";
import type { SiteSettings } from "@/lib/content/schemas";

import { FormFields } from "./fields";

type Result = {
  ok?: boolean;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [value, setValue] = useState<SiteSettings>(settings);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setResult(null);
    startTransition(async () => {
      const response = await saveSettingsAction(value);
      setResult(response);
      if (response.ok) router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="sticky top-0 z-20 -mx-5 border-b border-line bg-[#f6f5f1]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 xl:-mx-14 xl:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label text-muted">Site</p>
            <h1 className="mt-2 font-serif text-3xl leading-none">
              Settings &amp; SEO
            </h1>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="label bg-ink px-5 py-3 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        These details power the header, footer, contact page, structured data
        and booking availability. Changes go live immediately.
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
        {settingsFormSections.map((section) => (
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
              value={value}
              onChange={(next) => setValue(next as unknown as SiteSettings)}
            />
          </section>
        ))}
      </div>

      <div className="mt-8 flex justify-end pb-8">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="label bg-ink px-6 py-4 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
