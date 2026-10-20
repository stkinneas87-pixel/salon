import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { togglePromotionFormAction } from "@/actions/promotions";
import { getPromotionsForAdmin } from "@/lib/db/queries";
import { formatDateShort, getSydneyToday } from "@/lib/utils";

export default async function AdminPromotionsPage() {
  await connection();
  const promotions = await getPromotionsForAdmin();
  const today = getSydneyToday();
  const activeCount = promotions.filter((promotion) => promotion.active).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-muted">Marketing</p>
          <h1 className="display mt-3 text-5xl">Promotions</h1>
          <p className="mt-2 text-sm text-muted">
            {promotions.length} promotions · {activeCount} active
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="label bg-ink px-5 py-3 text-white hover:bg-black"
        >
          + New promotion
        </Link>
      </div>

      <p className="mt-6 border border-line bg-white px-4 py-3 text-sm leading-relaxed text-muted">
        Active promotions appear in the landing-page modal. If more than one is
        active, they become a slider. A promotion is hidden if its linked
        service is inactive or still sample data.
      </p>

      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {["Promotion", "Service", "Order", "Status", ""].map((heading) => (
                <th key={heading} className="label px-4 py-3 text-muted">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => {
              const hiddenByService =
                !promotion.serviceActive || promotion.serviceIsSample;
              const thumbnail = promotion.images[0];
              const scheduled = promotion.startDate > today;
              const expired =
                !promotion.unlimited &&
                promotion.endDate !== null &&
                promotion.endDate < today;
              return (
                <tr
                  key={promotion.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-line bg-mist">
                        {thumbnail ? (
                          <Image
                            src={thumbnail.src}
                            alt={thumbnail.alt || promotion.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <Link
                          href={`/admin/promotions/${promotion.id}`}
                          className="font-medium hover:underline"
                        >
                          {promotion.title}
                        </Link>
                        {promotion.kicker ? (
                          <p className="mt-1 text-xs text-muted">
                            {promotion.kicker}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted">
                          {promotion.unlimited
                            ? `From ${formatDateShort(promotion.startDate)} · Unlimited`
                            : `${formatDateShort(promotion.startDate)} – ${
                                promotion.endDate
                                  ? formatDateShort(promotion.endDate)
                                  : "No end date"
                              }`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {promotion.serviceName ?? "Service deleted"}
                    {hiddenByService ? (
                      <p className="mt-1 text-xs text-muted">
                        Hidden: service is inactive or sample
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">{promotion.sortOrder}</td>
                  <td className="px-4 py-4">
                    <span className="label text-muted">
                      {expired
                        ? "Expired"
                        : scheduled
                          ? "Scheduled"
                          : promotion.active
                            ? "Active"
                            : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <form action={togglePromotionFormAction}>
                        <input type="hidden" name="id" value={promotion.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={promotion.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="label border border-line px-3 py-2 text-muted hover:text-ink"
                        >
                          {promotion.active ? "Hide" : "Activate"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/promotions/${promotion.id}`}
                        className="label text-muted hover:text-ink"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {promotions.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted">
            No promotions yet. The landing modal stays hidden until you create
            and activate one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
