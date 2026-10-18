import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ServiceForm } from "@/components/admin/service-form";
import { getServiceById } from "@/lib/db/queries";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  return (
    <Suspense fallback={<p className="label text-muted">Loading service…</p>}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <ServiceForm
      id={service.id}
      isSample={service.isSample}
      initial={{
        name: service.name,
        slug: service.slug,
        category: service.category,
        description: service.description,
        inclusions: service.inclusions,
        priceCents: service.priceCents,
        priceType: service.priceType,
        durationMinutes: service.durationMinutes,
        image: service.image,
        active: service.active,
        sortOrder: service.sortOrder,
      }}
    />
  );
}
