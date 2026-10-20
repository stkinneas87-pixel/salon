"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deletePromotionAction,
  savePromotionAction,
} from "@/actions/promotions";
import type { ImageRef } from "@/lib/content/schemas";

import { FormFields, type FieldDef } from "./fields";

export type PromotionFormValue = {
  title: string;
  kicker: string;
  description: string;
  images: ImageRef[];
  serviceId: string;
  startDate: string;
  endDate: string | null;
  unlimited: boolean;
  active: boolean;
  sortOrder: number;
};

type ServiceOption = {
  id: string;
  name: string;
  active: boolean;
  isSample: boolean;
};

export function PromotionForm({
  id,
  initial,
  services,
}: {
  id?: string;
  initial: PromotionFormValue;
  services: ServiceOption[];
}) {
  const router = useRouter();
  const [value, setValue] = useState<PromotionFormValue>(initial);
  const [result, setResult] = useState<{ ok?: boolean; message?: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const fields: FieldDef[] = [
    { type: "text", name: "title", label: "Promotion title" },
    { type: "text", name: "kicker", label: "Kicker (optional)", help: "Small label above the title, e.g. “This month”." },
    { type: "textarea", name: "description", label: "Description", rows: 4 },
    {
      type: "imageList",
      name: "images",
      label: "Promotion images",
      help: "Add one or more images. More than one becomes a slider in the landing modal. The first image is the admin thumbnail.",
    },
    {
      type: "select",
      name: "serviceId",
      label: "Linked service",
      help: "The promo is hidden unless this service is active and bookable.",
      options: services.map((service) => ({
        value: service.id,
        label: `${service.name}${service.active ? "" : " (inactive)"}${service.isSample ? " · sample" : ""}`,
      })),
    },
    { type: "date", name: "startDate", label: "Start date" },
    {
      type: "boolean",
      name: "unlimited",
      label: "No end date (unlimited)",
      help: "The promo stays eligible until you deactivate it.",
    },
    {
      type: "date",
      name: "endDate",
      label: "End date",
      help: "The end date is inclusive. Ignored when unlimited is enabled.",
    },
    { type: "number", name: "sortOrder", label: "Sort order", min: 0, max: 9999 },
    { type: "boolean", name: "active", label: "Show this promotion in the landing modal" },
  ];

  function save() {
    setResult(null);
    startTransition(async () => {
      const response = await savePromotionAction(value, id);
      setResult(response);
      if (response.ok) {
        if (!id) router.push("/admin/promotions");
        else router.refresh();
      }
    });
  }

  function remove() {
    if (!id) return;
    if (!window.confirm("Delete this promotion? This cannot be undone.")) return;
    startTransition(async () => {
      const response = await deletePromotionAction(id);
      setResult(response);
      if (response.ok) router.push("/admin/promotions");
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/promotions" className="label text-muted hover:text-ink">
            ← Promotions
          </Link>
          <h1 className="display mt-4 text-5xl">
            {id ? "Edit promotion" : "New promotion"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            The image is shown in full colour in the landing modal.
          </p>
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
            disabled={pending || services.length === 0}
            className="label bg-ink px-5 py-3 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save promotion"}
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <p className="mt-6 border border-ink/20 bg-mist px-4 py-3 text-sm">
          Create a service first, then link it to a promotion.
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
        <FormFields
          fields={fields}
          value={value}
          onChange={(next) => {
            const nextValue = next as unknown as PromotionFormValue;
            if (nextValue.unlimited) nextValue.endDate = null;
            setValue(nextValue);
          }}
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3 pb-8">
        <Link
          href="/admin/promotions"
          className="label border border-line px-5 py-4 text-muted hover:text-ink"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={pending || services.length === 0}
          className="label bg-ink px-6 py-4 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save promotion"}
        </button>
      </div>
    </div>
  );
}
