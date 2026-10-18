import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { isValidDateString } from "@/lib/booking/slots";
import { expireStalePendingBookings, getBookings } from "@/lib/db/queries";
import { formatDateShort, formatPrice, formatTime } from "@/lib/utils";

type Search = {
  status?: string;
  date?: string;
  page?: string;
};

const statuses = [
  "pending_payment",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
] as const;

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function queryString(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await connection();
  return (
    <Suspense fallback={<p className="label text-muted">Loading bookings…</p>}>
      <Loader searchParams={searchParams} />
    </Suspense>
  );
}

async function Loader({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const status =
    params.status && statuses.includes(params.status as (typeof statuses)[number])
      ? (params.status as (typeof statuses)[number])
      : undefined;
  const date = params.date && isValidDateString(params.date)
    ? params.date
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  await expireStalePendingBookings();
  const data = await getBookings({ status, date, page });

  const filters = { status, date };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-muted">Bookings</p>
          <h1 className="display mt-3 text-5xl">Appointments</h1>
          <p className="mt-2 text-sm text-muted">{data.total} total</p>
        </div>
        <Link
          href={`/api/admin/bookings/export${queryString({ date })}`}
          className="label border border-line bg-white px-4 py-3 hover:bg-ink hover:text-white"
        >
          Export CSV ↓
        </Link>
      </div>

      <form className="mt-8 flex flex-wrap items-end gap-3 border border-line bg-white p-4">
        <label className="block">
          <span className="admin-label">Status</span>
          <select name="status" defaultValue={status ?? ""} className="admin-input min-w-40">
            <option value="">All</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="admin-label">Date</span>
          <input type="date" name="date" defaultValue={date ?? ""} className="admin-input" />
        </label>
        <button
          type="submit"
          className="label bg-ink px-5 py-3 text-white hover:bg-black"
        >
          Filter
        </button>
        {status || date ? (
          <Link href="/admin/bookings" className="label px-2 py-3 text-muted hover:text-ink">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mt-5 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Date", "Time", "Client", "Service", "Price", "Payment", "Status", "Email", ""].map(
                (heading) => (
                  <th key={heading} className="label px-4 py-3 text-muted">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((booking) => (
              <tr key={booking.id} className="border-b border-line last:border-0">
                <td className="px-4 py-4 whitespace-nowrap">
                  {formatDateShort(booking.date)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {formatTime(booking.startTime)}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-medium hover:underline"
                  >
                    {booking.customerName}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{booking.customerPhone}</p>
                </td>
                <td className="px-4 py-4">{booking.serviceName}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {formatPrice(booking.priceCents, booking.priceType)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="label text-muted">
                    {statusLabel(booking.paymentStatus)}
                  </span>
                  {booking.depositCents > 0 ? (
                    <p className="mt-1 text-xs text-muted">
                      {formatPrice(booking.depositCents, "fixed")}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <span className="label text-muted">{statusLabel(booking.status)}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="label text-muted">
                    {booking.ownerEmailStatus}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="label text-muted hover:text-ink"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted">No bookings match this filter.</p>
        ) : null}
      </div>

      {data.pages > 1 ? (
        <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
          <Link
            href={`/admin/bookings${queryString({
              ...filters,
              page: data.page > 2 ? String(data.page - 1) : undefined,
            })}`}
            className={data.page === 1 ? "pointer-events-none text-muted/40" : "text-muted hover:text-ink"}
          >
            ← Previous
          </Link>
          <span className="label text-muted">
            Page {data.page} of {data.pages}
          </span>
          <Link
            href={`/admin/bookings${queryString({
              ...filters,
              page: data.page < data.pages ? String(data.page + 1) : undefined,
            })}`}
            className={
              data.page === data.pages
                ? "pointer-events-none text-muted/40"
                : "text-muted hover:text-ink"
            }
          >
            Next →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
