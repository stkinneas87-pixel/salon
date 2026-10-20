import Link from "next/link";
import { connection } from "next/server";

import { toggleServiceFormAction } from "@/actions/services";
import { ServicePrice } from "@/components/site/service-price";
import { getAllServices } from "@/lib/db/queries";
import { formatDuration } from "@/lib/utils";

export default async function AdminServicesPage() {
  await connection();
  const services = await getAllServices();
  const sampleCount = services.filter((service) => service.isSample).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-muted">Content</p>
          <h1 className="display mt-3 text-5xl">Services</h1>
          <p className="mt-2 text-sm text-muted">
            {services.length} services · {services.filter((service) => service.active).length} live
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="label bg-ink px-5 py-3 text-white hover:bg-black"
        >
          + New service
        </Link>
      </div>

      {sampleCount > 0 ? (
        <p className="mt-6 border border-ink/20 bg-mist px-4 py-3 text-sm">
          {sampleCount} sample services are still marked for review. Edit each
          one to confirm the real price, duration and inclusions.
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Service", "Category", "Price", "Duration", "Order", "Status", ""].map(
                (heading) => (
                  <th key={heading} className="label px-4 py-3 text-muted">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-line last:border-0">
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="font-medium hover:underline"
                  >
                    {service.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted">/{service.slug}</span>
                    {service.isSample ? (
                      <span className="label border border-line px-1.5 py-0.5 text-[9px] text-muted">
                        Sample
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4">{service.category}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <ServicePrice
                    priceCents={service.priceCents}
                    salePriceCents={service.salePriceCents}
                    priceType={service.priceType}
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {formatDuration(service.durationMinutes)}
                </td>
                <td className="px-4 py-4">{service.sortOrder}</td>
                <td className="px-4 py-4">
                  <span className="label text-muted">
                    {service.isSample
                      ? "Sample — hidden"
                      : service.active
                        ? "Live"
                        : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {service.isSample ? (
                      <span className="label text-muted">Review to publish</span>
                    ) : (
                      <form action={toggleServiceFormAction}>
                        <input type="hidden" name="id" value={service.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={service.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="label border border-line px-3 py-2 text-muted hover:text-ink"
                        >
                          {service.active ? "Hide" : "Publish"}
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="label text-muted hover:text-ink"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted">
            No services yet. Create your first service to start taking bookings.
          </p>
        ) : null}
      </div>
    </div>
  );
}
