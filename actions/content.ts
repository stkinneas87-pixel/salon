"use server";

import { updateTag } from "next/cache";
import { ZodError } from "zod";

import { assertAdmin } from "@/lib/auth/session";
import {
  pageSeoSchema,
  pageSlugs,
  parsePageContent,
  type PageSlug,
} from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";

export type SaveResult = {
  ok: boolean;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
};

function zodErrors(error: ZodError): SaveResult {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    errors: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

export async function savePageAction(input: {
  slug: PageSlug;
  content: unknown;
  seo: unknown;
}): Promise<SaveResult> {
  await assertAdmin();

  if (!pageSlugs.includes(input.slug)) {
    return { ok: false, message: "Unknown page." };
  }

  try {
    const content = parsePageContent(input.slug, input.content);
    const seo = pageSeoSchema.parse(input.seo);
    const db = requireDb();

    await db
      .insert(pages)
      .values({ slug: input.slug, content, seo })
      .onConflictDoUpdate({
        target: pages.slug,
        set: { content, seo, updatedAt: new Date() },
      });

    updateTag("content");
    return { ok: true, message: "Saved. The public page is updated." };
  } catch (error) {
    if (error instanceof ZodError) return zodErrors(error);
    console.error("Unable to save page", error);
    return {
      ok: false,
      message:
        error instanceof Error && error.message.includes("DATABASE_URL")
          ? "Database is not configured."
          : "Could not save the page. Please try again.",
    };
  }
}

