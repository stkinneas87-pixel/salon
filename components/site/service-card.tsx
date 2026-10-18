import Link from "next/link";

import type { PublicService } from "@/lib/content/queries";
import { formatDuration, formatPrice } from "@/lib/utils";

import { Reveal } from "./reveal";

export function ServiceCard({
  service,
  index,
  showCategory = true,
}: {
  service: PublicService;
  index: number;
  showCategory?: boolean;
}) {
  return (
    <Reveal
      as="article"
      className="group grid gap-6 border-t border-line py-8 lg:grid-cols-[0.5fr_1.5fr_1fr_auto] lg:items-start lg:gap-10"
      delay={Math.min(index * 45, 220)}
    >
      <div className="label text-muted">
        {showCategory ? service.category : String(index + 1).padStart(2, "0")}
      </div>

      <div>
        <h3 className="font-serif text-3xl leading-none font-normal lg:text-4xl">
          {service.name}
        </h3>
        <p className="pretty mt-4 max-w-lg text-sm leading-relaxed text-muted">
          {service.description}
        </p>
        {service.inclusions.length ? (
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
            {service.inclusions.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="h-px w-3 bg-current" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-baseline gap-4 lg:flex-col lg:items-start lg:gap-2">
        <p className="text-lg tabular-nums">
          {formatPrice(service.priceCents, service.priceType)}
        </p>
        <p className="label text-muted">{formatDuration(service.durationMinutes)}</p>
      </div>

      <Link
        href={`/book?service=${service.slug}`}
        prefetch={false}
        className="label inline-flex items-center justify-between gap-8 border border-line px-4 py-3 transition-colors hover:bg-ink hover:text-white"
      >
        Book <span aria-hidden="true">↗</span>
      </Link>
    </Reveal>
  );
}
