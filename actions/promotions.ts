"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { ZodError } from "zod";

import { assertAdmin } from "@/lib/auth/session";
import { promotionInputSchema } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import { promotions } from "@/lib/db/schema";

import type { SaveResult } from "./content";

export type PromotionSaveResult = SaveResult & { id?: string };

export async function savePromotionAction(
  input: unknown,
  id?: string,
): Promise<PromotionSaveResult> {
  await assertAdmin();

  try {
    const parsed = promotionInputSchema.parse(input);
    const data = {
      ...parsed,
      endDate: parsed.unlimited ? null : parsed.endDate,
    };
    const db = requireDb();

    if (id) {
      const [row] = await db
        .update(promotions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(promotions.id, id))
        .returning({ id: promotions.id });

      if (!row) return { ok: false, message: "Promotion not found." };
      updateTag("content");
      revalidatePath("/admin/promotions");
      return { ok: true, message: "Promotion updated.", id: row.id };
    }

    const [row] = await db
      .insert(promotions)
      .values(data)
      .returning({ id: promotions.id });

    updateTag("content");
    revalidatePath("/admin/promotions");
    return { ok: true, message: "Promotion created.", id: row?.id };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Please fix the promotion details.",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    console.error("Unable to save promotion", error);
    return { ok: false, message: "Could not save the promotion. Please try again." };
  }
}

export async function togglePromotionFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const db = requireDb();
  await db
    .update(promotions)
    .set({ active, updatedAt: new Date() })
    .where(eq(promotions.id, id));
  updateTag("content");
  revalidatePath("/admin/promotions");
}

export async function deletePromotionAction(id: string): Promise<SaveResult> {
  await assertAdmin();
  const db = requireDb();
  await db.delete(promotions).where(eq(promotions.id, id));
  updateTag("content");
  revalidatePath("/admin/promotions");
  return { ok: true, message: "Promotion deleted." };
}
