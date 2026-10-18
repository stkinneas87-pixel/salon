"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { assertAdmin } from "@/lib/auth/session";
import { closureInputSchema } from "@/lib/content/schemas";
import { requireDb } from "@/lib/db/client";
import { closures } from "@/lib/db/schema";
import { getSydneyToday, timeToMinutes } from "@/lib/utils";

export type ClosureState = {
  ok?: boolean;
  message?: string;
};

export async function saveClosureAction(
  _previous: ClosureState,
  formData: FormData,
): Promise<ClosureState> {
  await assertAdmin();

  try {
    const data = closureInputSchema.parse({
      date: formData.get("date"),
      allDay: formData.get("allDay") === "on",
      startTime: formData.get("startTime") || "09:00",
      endTime: formData.get("endTime") || "17:00",
      reason: formData.get("reason") || "",
    });

    if (Number.isNaN(new Date(`${data.date}T00:00:00Z`).getTime())) {
      return { ok: false, message: "Choose a valid date." };
    }

    if (data.date < getSydneyToday()) {
      return { ok: false, message: "Choose today or a future date." };
    }

    if (
      !data.allDay &&
      timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)
    ) {
      return { ok: false, message: "The end time must be after the start time." };
    }

    const db = requireDb();
    await db.insert(closures).values({
      date: data.date,
      startTime: data.allDay ? null : data.startTime,
      endTime: data.allDay ? null : data.endTime,
      reason: data.reason,
    });

    revalidatePath("/admin/availability");
    return { ok: true, message: "Closure added." };
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, message: error.issues[0]?.message ?? "Check the closure details." };
    }
    console.error("Unable to save closure", error);
    return { ok: false, message: "Could not save the closure." };
  }
}

export async function deleteClosureAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = requireDb();
  await db.delete(closures).where(eq(closures.id, id));
  revalidatePath("/admin/availability");
}
