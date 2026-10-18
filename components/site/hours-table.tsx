import { dayKeys, dayLabel, type SiteSettings } from "@/lib/content/schemas";
import { cn, formatHourRange, isDayClosed } from "@/lib/utils";

export function HoursTable({
  hours,
  light = false,
}: {
  hours: SiteSettings["hours"];
  light?: boolean;
}) {
  return (
    <dl className="hours-grid">
      {dayKeys.map((day) => {
        const value = hours[day];
        const closed = isDayClosed(value);
        return (
          <div
            key={day}
            className={cn(
              "contents",
              closed && (light ? "text-white/55" : "text-muted"),
            )}
          >
            <dt className="border-t border-current/15 py-3 text-sm">
              {dayLabel[day]}
            </dt>
            <dd className="border-t border-current/15 py-3 text-right text-sm tabular-nums">
              {closed ? "Closed" : formatHourRange(value.open, value.close)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
