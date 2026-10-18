import Link from "next/link";
import { connection } from "next/server";

import { deleteClosureAction } from "@/actions/closures";
import { ClosureForm } from "@/components/admin/closure-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { getSettingsForAdmin, getUpcomingClosures } from "@/lib/db/queries";
import { formatDateLong, formatTime, getSydneyToday } from "@/lib/utils";

export default async function AdminAvailabilityPage() {
  await connection();
  const [settings, closures] = await Promise.all([
    getSettingsForAdmin(),
    getUpcomingClosures(),
  ]);
  const today = getSydneyToday();

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="label text-muted">Bookings</p>
        <h1 className="display mt-3 text-5xl">Availability</h1>
        <p className="mt-2 text-sm text-muted">
          Capacity, notice periods and closures for online booking.
        </p>
      </div>

      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Capacity", settings.booking.capacity, "concurrent appointments"],
          ["Slot interval", `${settings.booking.slotIntervalMinutes} min`, "between start times"],
          ["Minimum notice", `${settings.booking.leadTimeMinutes} min`, "before a start time"],
          ["Booking window", `${settings.booking.maxAdvanceDays} days`, "ahead"],
        ].map(([label, value, note]) => (
          <div key={String(label)} className="bg-white p-5">
            <p className="label text-muted">{label}</p>
            <p className="mt-3 font-serif text-3xl leading-none">{value}</p>
            <p className="mt-2 text-xs text-muted">{note}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Change these rules in{" "}
        <Link href="/admin/settings" className="underline">
          Settings → Booking rules
        </Link>
        .
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <ClosureForm today={today} />

        <section>
          <h2 className="font-serif text-2xl">Upcoming closures</h2>
          {closures.length ? (
            <div className="mt-4 border border-line bg-white">
              {closures.map((closure) => (
                <div
                  key={closure.id}
                  className="flex items-center justify-between gap-4 border-b border-line px-4 py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm">{formatDateLong(closure.date)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {closure.startTime && closure.endTime
                        ? `${formatTime(closure.startTime)} – ${formatTime(closure.endTime)}`
                        : "All day"}
                      {closure.reason ? ` · ${closure.reason}` : ""}
                    </p>
                  </div>
                  <form action={deleteClosureAction}>
                    <input type="hidden" name="id" value={closure.id} />
                    <ConfirmButton
                      message="Remove this closure?"
                      className="label text-muted hover:text-ink"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 border border-line bg-white px-4 py-8 text-sm text-muted">
              No upcoming closures.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
