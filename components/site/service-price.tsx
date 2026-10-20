import {
  formatPrice,
  getEffectivePriceCents,
  hasSalePrice,
} from "@/lib/utils";

export function ServicePrice({
  priceCents,
  salePriceCents,
  priceType,
  className,
}: {
  priceCents: number;
  salePriceCents: number | null | undefined;
  priceType: "fixed" | "from";
  className?: string;
}) {
  const effective = getEffectivePriceCents(priceCents, salePriceCents);
  const onSale = hasSalePrice(priceCents, salePriceCents);
  const original = formatPrice(priceCents, priceType);
  const current = formatPrice(effective, priceType);

  if (!onSale) {
    return <span className={className}>{original}</span>;
  }

  return (
    <span
      className={className}
      aria-label={`Was ${original}, now ${current}`}
    >
      <span aria-hidden="true" className="text-muted/70 line-through">
        {original}
      </span>{" "}
      <span aria-hidden="true" className="font-medium text-red-600">
        {current}
      </span>
    </span>
  );
}
