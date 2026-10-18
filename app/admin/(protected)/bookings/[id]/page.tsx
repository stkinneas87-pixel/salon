import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  deleteBookingAction,
  resendBookingEmailAction,
  setBookingStatusAction,
  updateNotesAction,
} from "@/actions/bookings";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  getBookingById,
  getSettingsForAdmin,
} from "@/lib/db/queries";
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/utils";

const statuses = [
  ["confirmed", "Confirmed"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["no_show", "No show"],
] as const;

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  return (
    <Suspense fallback={<p className="label text-muted">Loading booking…</p>}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, settings] = await Promise.all([
    getBookingById(id),
    getSettingsForAdmin(),
  ]);
  if (!booking) notFound();

  const notifyEmail =
    settings.booking.notifyEmail || process.env.BOOKING_NOTIFY_EMAIL || "not set";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/bookings" className="label text-muted hover:text-ink">
            ← Bookings
          </Link>
          <h1 className="display mt-4 text-5xl">{booking.customerName}</h1>
          <p className="mt-2 text-sm text-muted">
            {booking.reference} · created{" "}
            {new Intl.DateTimeFormat("en-AU", {
              dateStyle: "medium",
              timeZone: "Australia/Sydney",
            }).format(booking.createdAt)}
          </p>
        </div>
        <span className="label border border-line bg-white px-3 py-2">
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-serif text-2xl">Appointment</h2>
          <dl className="mt-4 text-sm">
            {[
              ["Service", booking.serviceName],
              ["Date", formatDateLong(booking.date)],
              ["Time", `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`],
              ["Duration", formatDuration(booking.durationMinutes)],
              ["Price", `${formatPrice(booking.priceCents, booking.priceType)} · pay in salon`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[7rem_1fr] gap-3 border-t border-line py-3"
              >
                <dt className="label pt-1 text-muted">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 font-serif text-2xl">Client</h2>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <p>
              <a href={`tel:${booking.customerPhone}`} className="link-underline">
                {booking.customerPhone}
              </a>
            </p>
            <p>
              <a href={`mailto:${booking.customerEmail}`} className="link-underline">
                {booking.customerEmail}
              </a>
            </p>
            {booking.notes ? (
              <p className="whitespace-pre-wrap text-muted">{booking.notes}</p>
            ) : null}
          </div>

          <form action={updateNotesAction} className="mt-6 border-t border-line pt-5">
            <input type="hidden" name="id" value={booking.id} />
            <label className="block">
              <span className="admin-label">Internal notes (not shown to client)</span>
              <textarea
                name="notes"
                rows={3}
                defaultValue={booking.internalNotes}
                className="admin-input resize-y"
              />
            </label>
            <button
              type="submit"
              className="label mt-3 border border-line px-4 py-3 hover:bg-ink hover:text-white"
            >
              Save note
            </button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="admin-card p-5">
            <h2 className="font-serif text-2xl">Status</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statuses.map(([value, label]) => (
                <form key={value} action={setBookingStatusAction}>
                  <input type="hidden" name="id" value={booking.id} />
                  <input type="hidden" name="status" value={value} />
                  <button
                    type="submit"
                    className={`label w-full border px-3 py-3 ${
                      booking.status === value
                        ? "border-ink bg-ink text-white"
                        : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
          </section>

          <section className="admin-card p-5">
            <h2 className="font-serif text-2xl">Email</h2>
            <p className="mt-2 text-xs text-muted">Alerts go to {notifyEmail}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Owner: <span className="label">{booking.ownerEmailStatus}</span></p>
              <p>Client: <span className="label">{booking.customerEmailStatus}</span></p>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["both", "Resend both"],
                ["owner", "Resend owner"],
                ["customer", "Resend client"],
              ].map(([kind, label]) => (
                <form key={kind} action={resendBookingEmailAction}>
                  <input type="hidden" name="id" value={booking.id} />
                  <input type="hidden" name="kind" value={kind} />
                  <button
                    type="submit"
                    className="label w-full border border-line px-3 py-3 text-muted hover:text-ink"
                  >
                    {label}
                  </button>
                </form>
              ))}
            </div>
          </section>

          <section className="admin-card border-ink/20 p-5">
            <h2 className="font-serif text-2xl">Danger zone</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Permanently delete this booking and its personal data.
            </p>
            <form action={deleteBookingAction} className="mt-4">
              <input type="hidden" name="id" value={booking.id} />
              <ConfirmButton
                message="Permanently delete this booking?"
                className="label w-full border border-ink/30 px-3 py-3 text-ink hover:bg-ink hover:text-white"
              >
                Delete booking
              </ConfirmButton>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
