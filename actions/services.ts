"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { ZodError } from "zod";

import { assertAdmin } from "@/lib/auth/session";
import { serviceInputSchema } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import { countServiceBookings } from "@/lib/db/queries";
import { services } from "@/lib/db/schema";

import type { SaveResult } from "./content";

export type ServiceSaveResult = SaveResult & { id?: string };

export async function saveServiceAction(
  input: unknown,
  id?: string,
): Promise<ServiceSaveResult> {
  await assertAdmin();

  try {
    const data = serviceInputSchema.parse(input);
    const db = requireDb();

    if (id) {
      const [row] = await db
        .update(services)
        .set({
          ...data,
          isSample: false,
          updatedAt: new Date(),
        })
        .where(eq(services.id, id))
        .returning({ id: services.id });

      if (!row) return { ok: false, message: "Service not found." };
      updateTag("content");
      return { ok: true, message: "Service updated.", id: row.id };
    }

    const [row] = await db
      .insert(services)
      .values({ ...data, isSample: false })
      .returning({ id: services.id });

    updateTag("content");
    return { ok: true, message: "Service created.", id: row?.id };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Please fix the service details.",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return { ok: false, message: "That slug is already used by another service." };
    }

    console.error("Unable to save service", error);
    return { ok: false, message: "Could not save the service. Please try again." };
  }
}

export async function toggleServiceAction(id: string, active: boolean) {
  await assertAdmin();
  const db = requireDb();
  await db
    .update(services)
    .set({ active, updatedAt: new Date() })
    .where(eq(services.id, id));
  updateTag("content");
  return { ok: true };
}

export async function toggleServiceFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await toggleServiceAction(id, active);
}

export async function deleteServiceAction(id: string): Promise<SaveResult> {
  await assertAdmin();
  const bookings = await countServiceBookings(id);
  if (bookings > 0) {
    return {
      ok: false,
      message:
        "This service has bookings attached. Deactivate it instead of deleting it.",
    };
  }

  const db = requireDb();
  await db.delete(services).where(eq(services.id, id));
  updateTag("content");
  return { ok: true, message: "Service deleted." };
}
