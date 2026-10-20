import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { PromotionForm } from "@/components/admin/promotion-form";
import { getAllServices, getPromotionById } from "@/lib/db/queries";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  return (
    <Suspense fallback={<p className="label text-muted">Loading promotion…</p>}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [promotion, services] = await Promise.all([
    getPromotionById(id),
    getAllServices(),
  ]);
  if (!promotion) notFound();

  return (
    <PromotionForm
      id={promotion.id}
      initial={{
        title: promotion.title,
        kicker: promotion.kicker,
        description: promotion.description,
        images: promotion.images,
        serviceId: promotion.serviceId,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        unlimited: promotion.unlimited,
        active: promotion.active,
        sortOrder: promotion.sortOrder,
      }}
      services={services.map((service) => ({
        id: service.id,
        name: service.name,
        active: service.active,
        isSample: service.isSample,
      }))}
    />
  );
}
