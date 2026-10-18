import Link from "next/link";
import { connection } from "next/server";

import { getDashboardData, getSettingsForAdmin } from "@/lib/db/queries";
import { isEmailConfigured } from "@/lib/email/send";
import {
  getStripeMode,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { formatDateShort, formatPrice, formatTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await connection();
  const [data, settings] = await Promise.all([
    getDashboardData(),
    getSettingsForAdmin(),
  ]);

  const notifyEmail =
    settings.booking.notifyEmail || process.env.BOOKING_NOTIFY_EMAIL || "";
  const stripeMode = getStripeMode();
  const stripeConfigured = isStripeConfigured();

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-muted">Hair &amp; Co</p>
          <h1 className="display mt-3 text-5xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Today is {formatDateShort(data.today)} · all times Sydney.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="label border border-line bg-white px-4 py-3 hover:bg-ink hover:text-white"
        >
          View bookings ↗
        </Link>
      </div>

      {data.sampleCount > 0 ? (
        <div className="border border-ink/20 bg-mist px-5 py-4 text-sm leading-relaxed">
          <strong>{data.sampleCount} sample services</strong> are waiting for
          review. They stay hidden from the public site until you edit and save
          them. Review the prices, durations and inclusions in{" "}
          <Link href="/admin/services" className="underline">
            Services
          </Link>{" "}
          before launch.
        </div>
      ) : null}

      {!isEmailConfigured() || !notifyEmail ? (
        <div className="border border-ink/20 bg-white px-5 py-4 text-sm leading-relaxed">
          <strong>Booking email is not fully configured.</strong> Add{" "}
          <code className="bg-mist px-1">RESEND_API_KEY</code>,{" "}
          <code className="bg-mist px-1">BOOKING_FROM_EMAIL</code> and a booking
          notification email in Settings. Bookings are still saved here.
        </div>
      ) : null}

      {settings.payments.enabled && !stripeConfigured ? (
        <div className="border border-ink/20 bg-mist px-5 py-4 text-sm leading-relaxed">
          <strong>Stripe payments are enabled but not configured.</strong> Online
          booking is blocked. Add test/live Stripe keys and the webhook secret,
          then redeploy.
        </div>
      ) : null}

      {settings.payments.enabled && stripeMode === "test" ? (
        <div className="border border-ink/20 bg-white px-5 py-4 text-sm leading-relaxed">
          <strong>Stripe test mode is active.</strong> Deposits are not real
          money. Switch to live keys before taking real bookings.
        </div>
      ) : null}

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Today", data.todayCount, "confirmed appointments"],
          ["Next 7 days", data.weekCount, "confirmed appointments"],
          ["Pending payments", data.pendingCount, "checkout in progress"],
          ["Sample services", data.sampleCount, "need review"],
          [
            "Email alerts",
            isEmailConfigured() && notifyEmail ? "On" : "Off",
            notifyEmail || "not set",
          ],
        ].map(([label, value, note]) => (
          <div key={String(label)} className="bg-white p-5">
            <p className="label text-muted">{label}</p>
            <p className="mt-4 font-serif text-4xl leading-none">{value}</p>
            <p className="mt-2 truncate text-xs text-muted">{note}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl">Upcoming bookings</h2>
          <Link href="/admin/bookings" className="label text-muted hover:text-ink">
            All bookings
          </Link>
        </div>

        {data.recent.length ? (
          <div className="mt-5 overflow-x-auto border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {["Date", "Time", "Client", "Service", "Price", "Status"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="label px-4 py-3 text-muted"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.recent.map((booking) => (
                  <tr key={booking.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateShort(booking.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatTime(booking.startTime)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="link-underline"
                      >
                        {booking.customerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{booking.serviceName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPrice(booking.priceCents, booking.priceType)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="label text-muted">{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 border border-line bg-white px-5 py-8 text-sm text-muted">
            No upcoming bookings yet.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Edit home page", "/admin/content/home"],
          ["Manage services", "/admin/services"],
          ["Opening hours & SEO", "/admin/settings"],
          ["Block dates", "/admin/availability"],
          ["Review bookings", "/admin/bookings"],
          ["Open public site", "/"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between border border-line bg-white px-5 py-4 text-sm hover:bg-ink hover:text-white"
          >
            {label}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
