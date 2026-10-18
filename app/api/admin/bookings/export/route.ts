import { getSession } from "@/lib/auth/session";
import { isValidDateString } from "@/lib/booking/slots";
import { getBookingsForCsv } from "@/lib/db/queries";

function cell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date") ?? "";
  const date = isValidDateString(requestedDate) ? requestedDate : undefined;
  const bookings = await getBookingsForCsv(date);

  const header = [
    "Reference",
    "Date",
    "Start",
    "End",
    "Service",
    "Duration (min)",
    "Price (AUD)",
    "Price type",
    "Customer",
    "Phone",
    "Email",
    "Status",
    "Client notes",
    "Internal notes",
    "Created",
  ];

  const rows = bookings.map((booking) =>
    [
      booking.reference,
      booking.date,
      booking.startTime.slice(0, 5),
      booking.endTime.slice(0, 5),
      booking.serviceName,
      booking.durationMinutes,
      (booking.priceCents / 100).toFixed(2),
      booking.priceType,
      booking.customerName,
      booking.customerPhone,
      booking.customerEmail,
      booking.status,
      booking.notes,
      booking.internalNotes,
      booking.createdAt.toISOString(),
    ]
      .map(cell)
      .join(","),
  );

  const csv = `\uFEFF${header.map(cell).join(",")}\n${rows.join("\n")}`;
  const filename = `hair-and-co-bookings${date ? `-${date}` : ""}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
