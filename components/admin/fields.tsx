"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ImageRef } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

export type FieldDef =
  | {
      type: "text" | "url" | "time" | "password";
      name: string;
      label: string;
      help?: string;
      placeholder?: string;
      wide?: boolean;
    }
  | {
      type: "textarea";
      name: string;
      label: string;
      help?: string;
      placeholder?: string;
      rows?: number;
    }
  | {
      type: "number";
      name: string;
      label: string;
      help?: string;
      min?: number;
      max?: number;
      step?: number;
      wide?: boolean;
    }
  | {
      type: "money";
      name: string;
      label: string;
      help?: string;
      wide?: boolean;
    }
  | {
      type: "boolean";
      name: string;
      label: string;
      help?: string;
      wide?: boolean;
    }
  | {
      type: "select";
      name: string;
      label: string;
      help?: string;
      options: Array<{ value: string; label: string }>;
      wide?: boolean;
    }
  | {
      type: "image";
      name: string;
      label: string;
      help?: string;
    }
  | {
      type: "stringList";
      name: string;
      label: string;
      help?: string;
      itemLabel?: string;
      placeholder?: string;
    }
  | {
      type: "imageList";
      name: string;
      label: string;
      help?: string;
    }
  | {
      type: "object";
      name: string;
      label: string;
      help?: string;
      fields: FieldDef[];
    }
  | {
      type: "objectList";
      name: string;
      label: string;
      help?: string;
      itemLabel: string;
      fields: FieldDef[];
      min?: number;
      max?: number;
    };

export type FormSection = {
  title: string;
  description?: string;
  fields: FieldDef[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
    case "money":
      return 0;
    case "time":
      return "09:00";
    case "image":
      return null;
    case "stringList":
    case "imageList":
    case "objectList":
      return [];
    case "object":
      return Object.fromEntries(field.fields.map((child) => [child.name, emptyValue(child)]));
    case "select":
      return field.options[0]?.value ?? "";
    default:
      return "";
  }
}

export function emptyObject(fields: FieldDef[]) {
  return Object.fromEntries(fields.map((field) => [field.name, emptyValue(field)]));
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="admin-label" id={htmlFor ? `${htmlFor}-label` : undefined}>
      {children}
    </span>
  );
}

function Help({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>;
}

function InputShell({
  field,
  wide,
  children,
}: {
  field: FieldDef;
  wide: boolean;
  children: React.ReactNode;
}) {
  const canWrapLabel = ![
    "image",
    "stringList",
    "imageList",
    "objectList",
  ].includes(field.type);

  return (
    <div className={cn("min-w-0", wide && "md:col-span-2")}>
      {canWrapLabel ? (
        <label className="block">
          <Label>{field.label}</Label>
          {children}
        </label>
      ) : (
        <div>
          <Label>{field.label}</Label>
          <div className="mt-1">{children}</div>
        </div>
      )}
      <Help>{field.help}</Help>
    </div>
  );
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");

  const bitmap = await createImageBitmap(file);
  const max = 2400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.84),
  );
  if (!blob) return file;

  return new File(
    [blob],
    file.name.replace(/\.[^.]+$/, "") + ".webp",
    { type: "image/webp" },
  );
}

function ImageField({
  value,
  onChange,
}: {
  value: ImageRef | null;
  onChange: (value: ImageRef | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(`cms/${Date.now()}-${compressed.name}`, compressed, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: compressed.type,
      });
      onChange({
        ...(value ?? {}),
        src: blob.url,
        alt: value?.alt ?? "",
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const canPreview =
    Boolean(value?.src) &&
    (value!.src.startsWith("/") ||
      /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(value!.src));

  return (
    <div className="space-y-4">
      {value?.src ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden border border-line bg-mist">
            {canPreview ? (
              <Image
                src={value.src}
                alt={value.alt || "Image preview"}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-[10px] text-muted">
                Preview unavailable
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="text"
              className="admin-input"
              value={value.src}
              onChange={(event) =>
                onChange({ ...value, src: event.target.value })
              }
              aria-label="Image URL"
            />
            <input
              type="text"
              className="admin-input"
              value={value.alt}
              placeholder="Alt text (describe the image)"
              onChange={(event) =>
                onChange({ ...value, alt: event.target.value })
              }
              aria-label="Alt text"
            />
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-line px-5 py-8 text-center">
          <p className="text-sm text-muted">No image selected.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="label border border-line px-4 py-3 hover:bg-ink hover:text-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : value?.src ? "Replace image" : "Upload image"}
        </button>
        {value?.src ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="label border border-line px-4 py-3 text-muted hover:text-ink"
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {error ? <p className="text-xs text-ink">{error}</p> : null}
    </div>
  );
}

function ReorderButtons({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        className="flex h-8 w-8 items-center justify-center border border-line text-xs disabled:opacity-25"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(index, index + 1)}
        disabled={index === length - 1}
        className="flex h-8 w-8 items-center justify-center border border-line text-xs disabled:opacity-25"
        aria-label="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center border border-line text-xs text-muted hover:text-ink"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}

function getPath(record: UnknownRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return undefined;
    }
    return (value as UnknownRecord)[key];
  }, record);
}

function setPath(record: UnknownRecord, path: string, next: unknown): UnknownRecord {
  const [head, ...rest] = path.split(".");
  if (!head) return record;
  if (rest.length === 0) return { ...record, [head]: next };

  const child = asRecord(record[head]);
  return {
    ...record,
    [head]: setPath(child, rest.join("."), next),
  };
}

export function FormFields({
  fields,
  value,
  onChange,
}: {
  fields: FieldDef[];
  value: unknown;
  onChange: (value: UnknownRecord) => void;
}) {
  const record = asRecord(value);

  function setField(name: string, next: unknown) {
    onChange(setPath(record, name, next));
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((field) => {
        const current = getPath(record, field.name);
        const wide =
          field.type === "textarea" ||
          field.type === "image" ||
          field.type === "imageList" ||
          field.type === "stringList" ||
          field.type === "object" ||
          field.type === "objectList" ||
          ("wide" in field && field.wide === true);

        switch (field.type) {
          case "text":
          case "url":
          case "time":
          case "password":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <input
                  type={field.type}
                  className="admin-input"
                  value={String(current ?? "")}
                  placeholder={field.placeholder}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              </InputShell>
            );

          case "textarea":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <textarea
                  className="admin-input resize-y"
                  rows={field.rows ?? 4}
                  value={String(current ?? "")}
                  placeholder={field.placeholder}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              </InputShell>
            );

          case "number":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <input
                  type="number"
                  className="admin-input"
                  value={Number(current ?? 0)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(event) =>
                    setField(field.name, Number(event.target.value))
                  }
                />
              </InputShell>
            );

          case "money":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
                    $
                  </span>
                  <input
                    type="number"
                    className="admin-input pl-7"
                    min={0}
                    step="0.01"
                    value={Number(current ?? 0) / 100}
                    onChange={(event) =>
                      setField(
                        field.name,
                        Math.round(Number(event.target.value) * 100),
                      )
                    }
                  />
                </div>
              </InputShell>
            );

          case "boolean":
            return (
              <div key={field.name} className={cn("min-w-0", wide && "md:col-span-2")}>
                <label className="flex items-start gap-3 border border-line px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(current)}
                    onChange={(event) => setField(field.name, event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-black"
                  />
                  <span>
                    <span className="block text-sm">{field.label}</span>
                    {field.help ? (
                      <span className="mt-1 block text-xs text-muted">
                        {field.help}
                      </span>
                    ) : null}
                  </span>
                </label>
              </div>
            );

          case "select":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <select
                  className="admin-input"
                  value={String(current ?? "")}
                  onChange={(event) => setField(field.name, event.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </InputShell>
            );

          case "image":
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <ImageField
                  value={(current as ImageRef | null) ?? null}
                  onChange={(next) => setField(field.name, next)}
                />
              </InputShell>
            );

          case "stringList": {
            const items = Array.isArray(current) ? (current as string[]) : [];
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <textarea
                        className="admin-input min-h-11 resize-y"
                        rows={1}
                        value={item}
                        placeholder={field.placeholder}
                        aria-label={`${field.itemLabel ?? field.label} ${index + 1}`}
                        onChange={(event) => {
                          const next = [...items];
                          next[index] = event.target.value;
                          setField(field.name, next);
                        }}
                      />
                      <ReorderButtons
                        index={index}
                        length={items.length}
                        onMove={(from, to) => {
                          if (to < 0 || to >= items.length) return;
                          const next = [...items];
                          const [removed] = next.splice(from, 1);
                          next.splice(to, 0, removed);
                          setField(field.name, next);
                        }}
                        onRemove={() =>
                          setField(
                            field.name,
                            items.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setField(field.name, [...items, ""])}
                    className="label border border-line px-3 py-2 hover:bg-ink hover:text-white"
                  >
                    + Add {field.itemLabel ?? "item"}
                  </button>
                </div>
              </InputShell>
            );
          }

          case "imageList": {
            const items = Array.isArray(current) ? (current as ImageRef[]) : [];
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border border-line p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="label text-muted">Image {index + 1}</span>
                        <ReorderButtons
                          index={index}
                          length={items.length}
                          onMove={(from, to) => {
                            if (to < 0 || to >= items.length) return;
                            const next = [...items];
                            const [removed] = next.splice(from, 1);
                            next.splice(to, 0, removed);
                            setField(field.name, next);
                          }}
                          onRemove={() =>
                            setField(
                              field.name,
                              items.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                        />
                      </div>
                      <ImageField
                        value={item}
                        onChange={(next) => {
                          if (!next) {
                            setField(
                              field.name,
                              items.filter((_, itemIndex) => itemIndex !== index),
                            );
                            return;
                          }
                          const values = [...items];
                          values[index] = next;
                          setField(field.name, values);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setField(field.name, [...items, { src: "", alt: "" }])
                    }
                    className="label border border-line px-3 py-2 hover:bg-ink hover:text-white"
                  >
                    + Add image
                  </button>
                </div>
              </InputShell>
            );
          }

          case "object":
            return (
              <div key={field.name} className="md:col-span-2">
                <div className="border border-line p-4 sm:p-5">
                  <p className="label mb-4 text-muted">{field.label}</p>
                  <FormFields
                    fields={field.fields}
                    value={current}
                    onChange={(next) => setField(field.name, next)}
                  />
                  {field.help ? <Help>{field.help}</Help> : null}
                </div>
              </div>
            );

          case "objectList": {
            const items = Array.isArray(current) ? (current as UnknownRecord[]) : [];
            const atMin = field.min !== undefined && items.length <= field.min;
            const atMax = field.max !== undefined && items.length >= field.max;
            return (
              <InputShell key={field.name} field={field} wide={wide}>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="border border-line p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="label text-muted">
                          {field.itemLabel} {index + 1}
                        </p>
                        <div className="flex items-center gap-2">
                          <ReorderButtons
                            index={index}
                            length={items.length}
                            onMove={(from, to) => {
                              if (to < 0 || to >= items.length) return;
                              const next = [...items];
                              const [removed] = next.splice(from, 1);
                              next.splice(to, 0, removed);
                              setField(field.name, next);
                            }}
                            onRemove={() => {
                              if (atMin) return;
                              setField(
                                field.name,
                                items.filter((_, itemIndex) => itemIndex !== index),
                              );
                            }}
                          />
                        </div>
                      </div>
                      <FormFields
                        fields={field.fields}
                        value={item}
                        onChange={(next) => {
                          const values = [...items];
                          values[index] = next;
                          setField(field.name, values);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setField(field.name, [
                        ...items,
                        emptyObject(field.fields),
                      ])
                    }
                    disabled={atMax}
                    className="label border border-line px-3 py-2 hover:bg-ink hover:text-white disabled:opacity-30"
                  >
                    + Add {field.itemLabel.toLowerCase()}
                  </button>
                </div>
              </InputShell>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
