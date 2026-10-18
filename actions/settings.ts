"use server";

import { updateTag } from "next/cache";
import { ZodError } from "zod";

import { assertAdmin } from "@/lib/auth/session";
import { siteSettingsSchema } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

import type { SaveResult } from "./content";

export async function saveSettingsAction(input: unknown): Promise<SaveResult> {
  await assertAdmin();

  try {
    const data = siteSettingsSchema.parse(input);
    const db = requireDb();

    await db
      .insert(siteSettings)
      .values({ id: 1, data })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { data, updatedAt: new Date() },
      });

    updateTag("content");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    }
    console.error("Unable to save settings", error);
    return { ok: false, message: "Could not save settings. Please try again." };
  }
}
