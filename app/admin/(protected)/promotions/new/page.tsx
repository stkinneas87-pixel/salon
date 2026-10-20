import { connection } from "next/server";

import { PromotionForm } from "@/components/admin/promotion-form";
import { getAllServices } from "@/lib/db/queries";
import { getSydneyToday } from "@/lib/utils";

export default async function NewPromotionPage() {
  await connection();
  const services = await getAllServices();
  const preferred =
    services.find((service) => service.active && !service.isSample) ??
    services[0];
  const nextOrder =
    services.reduce((max, service) => Math.max(max, service.sortOrder), 0) + 10;

  return (
    <PromotionForm
      initial={{
        title: "",
        kicker: "",
        description: "",
        images: [],
        serviceId: preferred?.id ?? "",
        startDate: getSydneyToday(),
        endDate: null,
        unlimited: true,
        active: false,
        sortOrder: nextOrder,
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
