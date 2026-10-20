import { connection } from "next/server";

import { ServiceForm } from "@/components/admin/service-form";
import { getAllServices } from "@/lib/db/queries";

export default async function NewServicePage() {
  await connection();
  const services = await getAllServices();
  const nextOrder =
    services.reduce((max, service) => Math.max(max, service.sortOrder), 0) + 10;

  return (
    <ServiceForm
      initial={{
        name: "",
        slug: "",
        category: "Cuts",
        description: "",
        inclusions: [""],
        priceCents: 0,
        salePriceCents: null,
        priceType: "fixed",
        durationMinutes: 60,
        image: null,
        active: true,
        sortOrder: nextOrder,
      }}
    />
  );
}
