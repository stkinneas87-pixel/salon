"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteServiceAction, saveServiceAction } from "@/actions/services";
import { serviceFields } from "@/lib/content/forms";
import type { ImageRef } from "@/lib/content/schemas";
import { slugify } from "@/lib/utils";

import { FormFields } from "./fields";

export type ServiceFormValue = {
  name: string;
  slug: string;
  category: string;
  description: string;
  inclusions: string[];
  priceCents: number;
  salePriceCents: number | null;
  priceType: "fixed" | "from";
  durationMinutes: number;
  image: ImageRef | null;
  active: boolean;
  sortOrder: number;
};

export function ServiceForm({
  id,
  initial,
  isSample = false,
}: {
  id?: string;
  initial: ServiceFormValue;
  isSample?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ServiceFormValue>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [result, setResult] = useState<{ ok?: boolean; message?: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function update(next: Record<string, unknown>) {
    const nextValue = next as unknown as ServiceFormValue;
    const slugChanged = nextValue.slug !== value.slug;

    if (slugChanged) {
      setSlugTouched(true);
    } else if (!slugTouched && nextValue.name !== value.name) {
      nextValue.slug = slugify(nextValue.name);
    }

    setValue(nextValue);
  }

  function save() {
    setResult(null);
    startTransition(async () => {
      const response = await saveServiceAction(
        { ...value, slug: value.slug || slugify(value.name) },
        id,
      );
      setResult(response);
      if (response.ok) {
        if (!id) router.push("/admin/services");
        else router.refresh();
      }
    });
  }

  function remove() {
    if (!id) return;
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    startTransition(async () => {
      const response = await deleteServiceAction(id);
      setResult(response);
      if (response.ok) router.push("/admin/services");
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/services"
            className="label text-muted hover:text-ink"
          >
            ← Services
          </Link>
          <h1 className="display mt-4 text-5xl">
            {id ? "Edit service" : "New service"}
          </h1>
        </div>
        <div className="flex gap-2">
          {id ? (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="label border border-line px-4 py-3 text-muted hover:text-ink"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="label bg-ink px-5 py-3 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save service"}
          </button>
        </div>
      </div>

      {isSample ? (
        <p className="mt-6 border border-ink/20 bg-mist px-4 py-3 text-sm">
          This is sample data. Saving it will mark it as reviewed.
        </p>
      ) : null}

      {result?.message ? (
        <p
          role="status"
          className={`mt-6 border px-4 py-3 text-sm ${
            result.ok ? "border-line bg-white" : "border-ink/30 bg-mist"
          }`}
        >
          {result.message}
        </p>
      ) : null}

      <div className="admin-card mt-6 p-5 sm:p-6">
        <FormFields fields={serviceFields} value={value} onChange={update} />
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3 pb-8">
        <Link
          href="/admin/services"
          className="label border border-line px-5 py-4 text-muted hover:text-ink"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="label bg-ink px-6 py-4 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save service"}
        </button>
      </div>
    </div>
  );
}
