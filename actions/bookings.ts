"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertAdmin } from "@/lib/auth/session";
import { requireDb } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import {
  deleteBookingById,
  getBookingById,
  getSettingsForAdmin,
  updateBookingEmailStatuses,
  updateBookingStatus,
} from "@/lib/db/queries";
import {
  resendCustomerEmail,
  resendOwnerEmail,
} from "@/lib/email/send";

const statuses = ["confirmed", "cancelled", "completed", "no_show"] as const;

export async function setBookingStatusAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !statuses.includes(status as (typeof statuses)[number])) return;

  await updateBookingStatus(id, status as (typeof statuses)[number]);
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
}

export async function deleteBookingAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deleteBookingById(id);
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}

export async function resendBookingEmailAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const kind = String(formData.get("kind") ?? "both");
  if (!id) return;

  const [booking, settings] = await Promise.all([
    getBookingById(id),
    getSettingsForAdmin(),
  ]);
  if (!booking) return;

  let owner = booking.ownerEmailStatus;
  let customer = booking.customerEmailStatus;

  if (kind === "owner" || kind === "both") {
    owner = await resendOwnerEmail(booking, settings);
  }
  if (kind === "customer" || kind === "both") {
    customer = await resendCustomerEmail(booking, settings);
  }

  await updateBookingEmailStatuses(id, owner, customer);
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin/bookings");
}

export async function updateNotesAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 1000);
  if (!id) return;

  const db = requireDb();
  await db
    .update(bookings)
    .set({ internalNotes: notes, updatedAt: new Date() })
    .where(eq(bookings.id, id));
  revalidatePath(`/admin/bookings/${id}`);
}
