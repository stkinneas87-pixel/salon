"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PublicService } from "@/lib/content/queries";
import { ServicePrice } from "@/components/site/service-price";
import type { SiteSettings } from "@/lib/content/schemas";
import {
  calculateBalanceCents,
  calculateDepositCents,
} from "@/lib/payments/deposit";
import {
  addDays,
  cn,
  formatClosedDays,
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  getDayHours,
  getEffectivePriceCents,
  getSydneyToday,
  isDayClosed,
  timeToMinutes,
} from "@/lib/utils";

type Step = 1 | 2 | 3;

type Availability = {
  slots: string[];
  closed: boolean;
  reason?: string;
};

type Confirmation = {
  reference: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  priceCents: number;
  priceType: "fixed" | "from";
  emailStatuses?: {
    owner: string;
    customer: string;
  };
};

type ApiError = {
  error?: string;
  fields?: Array<{ path: string; message: string }>;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateString(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

function monthIndex(year: number, month: number) {
  return year * 12 + month;
}

function buildMonth(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const leading = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ day: number; date: string } | null> = [];

  for (let index = 0; index < leading; index++) cells.push(null);
  for (let day = 1; day <= days; day++) {
    cells.push({ day, date: dateString(year, month, day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type WizardSettings = {
  hours: SiteSettings["hours"];
  booking: Pick<
    SiteSettings["booking"],
    "maxAdvanceDays" | "policyNote" | "confirmationNote"
  >;
  payments: Pick<
    SiteSettings["payments"],
    "enabled" | "depositPercent" | "depositNote"
  >;
  terms: {
    version: string;
    href: string;
  };
  contact: Pick<
    SiteSettings["contact"],
    "phoneDisplay" | "phoneE164" | "addressFull" | "whatsappUrl"
  >;
};

export function BookingWizard({
  services,
  settings,
}: {
  services: PublicService[];
  settings: WizardSettings;
}) {
  const searchParams = useSearchParams();
  const querySlug = searchParams.get("service");
  const paymentCancelled = searchParams.get("payment") === "cancelled";
  const initialService = useMemo(
    () => services.find((service) => service.slug === querySlug) ?? null,
    [services, querySlug],
  );

  const [step, setStep] = useState<Step>(initialService ? 2 : 1);
  const [service, setService] = useState<PublicService | null>(initialService);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availabilityState, setAvailabilityState] = useState<{
    key: string;
    data: Availability;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [today] = useState(() => getSydneyToday());
  const [view, setView] = useState<{ year: number; month: number }>(() => {
    const [year, month] = getSydneyToday().split("-").map(Number);
    return { year, month: month - 1 };
  });
  const startedAtRef = useRef(0);

  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    consent: false,
    termsAccepted: false,
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const maxDate = addDays(today, settings.booking.maxAdvanceDays);
  const requestKey =
    service?.id && date ? `${service.id}:${date}:${refreshKey}` : "";

  const availability: Availability | null =
    service && !service.id
      ? {
          slots: [],
          closed: true,
          reason: "Online booking is not configured yet. Please call the salon.",
        }
      : requestKey && availabilityState?.key === requestKey
        ? availabilityState.data
        : null;

  const loadingSlots = Boolean(requestKey) && availabilityState?.key !== requestKey;

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!service?.id || !date) return;

    const key = `${service.id}:${date}:${refreshKey}`;
    const controller = new AbortController();

    fetch(
      `/api/availability?serviceId=${encodeURIComponent(service.id)}&date=${encodeURIComponent(date)}`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const data = (await response.json()) as Availability & ApiError;
        if (!response.ok) throw new Error(data.error || "Availability could not be loaded.");
        setAvailabilityState({
          key,
          data: {
            slots: Array.isArray(data.slots) ? data.slots : [],
            closed: Boolean(data.closed),
            reason: data.reason,
          },
        });
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setAvailabilityState({
          key,
          data: {
            slots: [],
            closed: true,
            reason:
              fetchError instanceof Error
                ? fetchError.message
                : "Availability could not be loaded.",
          },
        });
      });

    return () => controller.abort();
  }, [service, date, refreshKey]);

  function chooseService(next: PublicService) {
    setService(next);
    setDate("");
    setTime("");
    setError("");
    setFieldErrors({});
    setStep(2);
  }

  function chooseDate(next: string) {
    setDate(next);
    setTime("");
    setError("");
  }

  function canNavigate(direction: -1 | 1) {
    if (!view || !today || !maxDate) return false;
    const [todayYear, todayMonth] = today.split("-").map(Number);
    const [maxYear, maxMonth] = maxDate.split("-").map(Number);
    const current = monthIndex(view.year, view.month);
    if (direction === -1) return current > monthIndex(todayYear, todayMonth - 1);
    return current < monthIndex(maxYear, maxMonth - 1);
  }

  function moveMonth(direction: -1 | 1) {
    if (!view) return;
    const index = monthIndex(view.year, view.month) + direction;
    setView({ year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 });
  }

  function selectSlot(next: string) {
    setTime(next);
    setError("");
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !date || !time) {
      setError("Choose a service, date and time first.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          time,
          name: details.name,
          email: details.email,
          phone: details.phone,
          notes: details.notes,
          consent: details.consent,
          termsAccepted: details.termsAccepted,
          website: details.website,
          startedAt: startedAtRef.current,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        requiresPayment?: boolean;
        checkoutUrl?: string;
        booking?: Confirmation;
        emailStatuses?: { owner: string; customer: string };
      } & ApiError;

      if (response.ok && data.requiresPayment) {
        if (!data.checkoutUrl) {
          setError("Secure payment could not be started. Please call the salon.");
          return;
        }
        window.location.assign(data.checkoutUrl);
        return;
      }

      if (!response.ok || !data.booking) {
        if (response.status === 409) {
          setStep(2);
          setTime("");
          setRefreshKey((key) => key + 1);
        }
        if (data.fields?.length) {
          setFieldErrors(
            Object.fromEntries(data.fields.map((field) => [field.path, field.message])),
          );
        }
        setError(data.error || "The booking could not be completed.");
        return;
      }

      setConfirmation({
        ...data.booking,
        emailStatuses: data.emailStatuses,
      });
    } catch {
      setError("The booking could not be completed. Please call the salon.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setConfirmation(null);
    setService(null);
    setDate("");
    setTime("");
    setStep(1);
    setDetails({
      name: "",
      email: "",
      phone: "",
      notes: "",
      consent: false,
      termsAccepted: false,
      website: "",
    });
    startedAtRef.current = Date.now();
  }

  function downloadCalendar() {
    if (!confirmation) return;
    const start = confirmation.startTime.replace(":", "") + "00";
    const end = confirmation.endTime.replace(":", "") + "00";
    const datePart = confirmation.date.replaceAll("-", "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Hair & Co//Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${confirmation.reference}@hairandco`,
      `DTSTAMP:${stamp}Z`,
      `DTSTART;TZID=Australia/Sydney:${datePart}T${start}`,
      `DTEND;TZID=Australia/Sydney:${datePart}T${end}`,
      `SUMMARY:${confirmation.serviceName} at Hair & Co`,
      `LOCATION:${settings.contact.addressFull.replaceAll(",", "\\,")}`,
      `DESCRIPTION:Reference ${confirmation.reference}. Call ${settings.contact.phoneDisplay} to change.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    const blob = new Blob([lines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hair-and-co-${confirmation.reference}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (confirmation) {
    return (
      <div className="container-narrow py-16 lg:py-24">
        <p className="label text-muted">Booking confirmed</p>
        <h2 className="display mt-6 text-[clamp(3rem,6vw,5.5rem)]">
          See you soon.
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
          {confirmation.emailStatuses?.customer === "sent"
            ? `A confirmation has been sent to ${details.email}.`
            : settings.booking.confirmationNote}
        </p>

        <dl className="mt-10 border-t border-line">
          {[
            ["Reference", confirmation.reference],
            ["Service", confirmation.serviceName],
            ["Date", formatDateLong(confirmation.date)],
            [
              "Time",
              `${formatTime(confirmation.startTime)} – ${formatTime(confirmation.endTime)}`,
            ],
            ["Duration", formatDuration(confirmation.durationMinutes)],
            [
              "Price",
              `${formatPrice(confirmation.priceCents, confirmation.priceType)} · pay in salon`,
            ],
            ["Where", settings.contact.addressFull],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-4 text-sm"
            >
              <dt className="label pt-1 text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
          {settings.booking.policyNote}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadCalendar}
            className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white hover:bg-black"
          >
            Add to calendar <span aria-hidden="true">↓</span>
          </button>
          <a
            href={`tel:${settings.contact.phoneE164}`}
            className="label inline-flex items-center justify-between gap-8 border border-line px-5 py-4 hover:bg-ink hover:text-white"
          >
            Call {settings.contact.phoneDisplay}
          </a>
          {settings.contact.whatsappUrl ? (
            <a
              href={settings.contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center justify-between gap-8 border border-line px-5 py-4 hover:bg-ink hover:text-white"
            >
              WhatsApp <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="label inline-flex items-center px-2 py-4 text-muted hover:text-ink"
          >
            Book another appointment
          </button>
        </div>

        <p className="mt-10 text-sm text-muted">
          <Link href="/" className="link-underline">
            Back to Hair &amp; Co
          </Link>
        </p>
      </div>
    );
  }

  const slots = availability?.slots ?? [];
  const morning = slots.filter((slot) => timeToMinutes(slot) < 12 * 60);
  const afternoon = slots.filter((slot) => timeToMinutes(slot) >= 12 * 60);
  const effectivePrice = service
    ? getEffectivePriceCents(service.priceCents, service.salePriceCents)
    : 0;
  const depositCents =
    service && settings.payments.enabled
      ? calculateDepositCents(effectivePrice, settings.payments.depositPercent)
      : 0;
  const balanceCents =
    service && settings.payments.enabled
      ? calculateBalanceCents(effectivePrice, depositCents)
      : effectivePrice;

  return (
    <div className="container-editorial py-12 lg:py-20">
      {paymentCancelled ? (
        <div
          role="status"
          className="mb-8 border border-ink/25 bg-mist px-4 py-3 text-sm leading-relaxed"
        >
          Payment was not completed. Your time is held temporarily for up to 30
          minutes. You can try again, or call the salon for help.
        </div>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-[1fr_23rem] lg:gap-16">
        <div>
          <ol className="mb-10 flex flex-wrap gap-6 border-b border-line pb-5">
            {[
              [1, "Service"],
              [2, "Date & time"],
              [3, "Your details"],
            ].map(([number, label]) => (
              <li
                key={String(number)}
                className={cn(
                  "label flex items-center gap-2",
                  step === number ? "text-ink" : "text-muted/55",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center border text-[10px]",
                    step === number ? "border-ink bg-ink text-white" : "border-line",
                  )}
                >
                  {number}
                </span>
                {label}
              </li>
            ))}
          </ol>

          {error ? (
            <div
              role="alert"
              className="mb-8 border border-ink/25 bg-mist px-4 py-3 text-sm"
            >
              {error}
            </div>
          ) : null}

          {step === 1 ? (
            <section aria-labelledby="choose-service">
              <h2 id="choose-service" className="display text-4xl lg:text-5xl">
                Choose a service.
              </h2>
              <p className="mt-3 text-sm text-muted">
                Every appointment includes a consultation.
              </p>

              {services.length ? (
                <div className="mt-8 border-t border-line">
                  {services.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => chooseService(item)}
                      disabled={!item.id}
                      className="group grid w-full grid-cols-[1fr_auto] gap-4 border-b border-line py-5 text-left transition-colors hover:bg-mist/60 disabled:cursor-not-allowed disabled:opacity-50 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <div>
                        <p className="label text-muted">{item.category}</p>
                        <p className="mt-2 font-serif text-2xl leading-none">
                          {item.name}
                        </p>
                      </div>
                      <p className="self-center text-sm tabular-nums">
                        <ServicePrice
                          priceCents={item.priceCents}
                          salePriceCents={item.salePriceCents}
                          priceType={item.priceType}
                        />
                      </p>
                      <p className="hidden self-center text-sm text-muted sm:block">
                        {formatDuration(item.durationMinutes)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-8 border-t border-line pt-6 text-sm text-muted">
                  Online booking is not available right now. Call{" "}
                  <a
                    href={`tel:${settings.contact.phoneE164}`}
                    className="link-underline text-ink"
                  >
                    {settings.contact.phoneDisplay}
                  </a>{" "}
                  and we&apos;ll help you book.
                </p>
              )}
            </section>
          ) : null}

          {step === 2 && service ? (
            <section aria-labelledby="choose-time">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 id="choose-time" className="display text-4xl lg:text-5xl">
                    Choose a time.
                  </h2>
                  <p className="mt-3 text-sm text-muted">
                    {service.name} · {formatDuration(service.durationMinutes)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="label text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Change service
                </button>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                <div className="border border-line p-4 sm:p-6">
                  {!today || !view ? (
                    <div className="h-72 animate-pulse bg-mist" />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => moveMonth(-1)}
                          disabled={!canNavigate(-1)}
                          className="flex h-9 w-9 items-center justify-center border border-line disabled:opacity-25"
                          aria-label="Previous month"
                        >
                          ←
                        </button>
                        <p className="label" aria-live="polite">
                          {monthLabel(view.year, view.month)}
                        </p>
                        <button
                          type="button"
                          onClick={() => moveMonth(1)}
                          disabled={!canNavigate(1)}
                          className="flex h-9 w-9 items-center justify-center border border-line disabled:opacity-25"
                          aria-label="Next month"
                        >
                          →
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
                        {WEEKDAYS.map((day) => (
                          <div key={day} className="label py-2 text-[9px] text-muted">
                            {day}
                          </div>
                        ))}
                        {buildMonth(view.year, view.month).map((cell, index) => {
                          if (!cell) return <div key={`empty-${index}`} />;
                          const closed =
                            !maxDate ||
                            cell.date < today ||
                            cell.date > maxDate ||
                            isDayClosed(getDayHours(settings.hours, cell.date));
                          return (
                            <button
                              key={cell.date}
                              type="button"
                              onClick={() => chooseDate(cell.date)}
                              disabled={closed}
                              aria-pressed={date === cell.date}
                              aria-label={formatDateLong(cell.date)}
                              className={cn(
                                "flex aspect-square items-center justify-center text-sm tabular-nums transition-colors",
                                closed && "text-muted/30",
                                !closed && "hover:bg-mist",
                                date === cell.date && "bg-ink text-white hover:bg-ink",
                              )}
                            >
                              {cell.day}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-xs text-muted">
                        {formatClosedDays(settings.hours)
                          ? `${formatClosedDays(settings.hours)}. `
                          : ""}
                        Times are shown in Sydney time.
                      </p>
                    </>
                  )}
                </div>

                <div aria-live="polite">
                  {!date ? (
                    <p className="text-sm text-muted">Select a date to see times.</p>
                  ) : loadingSlots ? (
                    <div className="space-y-2">
                      <div className="h-10 animate-pulse bg-mist" />
                      <div className="h-10 animate-pulse bg-mist" />
                      <div className="h-10 animate-pulse bg-mist" />
                    </div>
                  ) : availability?.closed || slots.length === 0 ? (
                    <p className="text-sm leading-relaxed text-muted">
                      {availability?.reason ||
                        "No times are available on this date."}{" "}
                      Call{" "}
                      <a
                        href={`tel:${settings.contact.phoneE164}`}
                        className="link-underline text-ink"
                      >
                        {settings.contact.phoneDisplay}
                      </a>{" "}
                      if you need help.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {[
                        ["Morning", morning],
                        ["Afternoon", afternoon],
                      ].map(([label, group]) =>
                        Array.isArray(group) && group.length ? (
                          <div key={String(label)}>
                            <p className="label mb-2 text-muted">{label}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {group.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => selectSlot(slot)}
                                  aria-pressed={time === slot}
                                  className={cn(
                                    "border py-3 text-sm tabular-nums transition-colors",
                                    time === slot
                                      ? "border-ink bg-ink text-white"
                                      : "border-line hover:border-ink",
                                  )}
                                >
                                  {formatTime(slot)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="label inline-flex items-center border border-line px-5 py-4 hover:bg-mist"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!time}
                  className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Continue <span aria-hidden="true">↗</span>
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 && service && date && time ? (
            <section aria-labelledby="your-details">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 id="your-details" className="display text-4xl lg:text-5xl">
                    Your details.
                  </h2>
                  <p className="mt-3 text-sm text-muted">
                    We&apos;ll only use these to manage your appointment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="label text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Change time
                </button>
              </div>

              <form onSubmit={submitBooking} className="mt-8 space-y-5">
                <input
                  type="text"
                  name="website"
                  value={details.website}
                  onChange={(event) =>
                    setDetails((current) => ({ ...current, website: event.target.value }))
                  }
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="admin-label">Name</span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={details.name}
                      onChange={(event) =>
                        setDetails((current) => ({ ...current, name: event.target.value }))
                      }
                      className="admin-input"
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name ? (
                      <span className="mt-1 block text-xs text-ink">{fieldErrors.name}</span>
                    ) : null}
                  </label>
                  <label className="block">
                    <span className="admin-label">Phone</span>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={details.phone}
                      onChange={(event) =>
                        setDetails((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="admin-input"
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone ? (
                      <span className="mt-1 block text-xs text-ink">{fieldErrors.phone}</span>
                    ) : null}
                  </label>
                </div>

                <label className="block">
                  <span className="admin-label">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={details.email}
                    onChange={(event) =>
                      setDetails((current) => ({ ...current, email: event.target.value }))
                    }
                    className="admin-input"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email ? (
                    <span className="mt-1 block text-xs text-ink">{fieldErrors.email}</span>
                  ) : null}
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                    Use an email address you check. Your confirmation and tax
                    invoice are sent here after payment.
                  </span>
                </label>

                <label className="block">
                  <span className="admin-label">Anything we should know? (optional)</span>
                  <textarea
                    rows={4}
                    value={details.notes}
                    onChange={(event) =>
                      setDetails((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="admin-input resize-y"
                    placeholder="Hair history, inspiration, accessibility needs…"
                  />
                </label>

                <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    required
                    checked={details.consent && details.termsAccepted}
                    onChange={(event) =>
                      setDetails((current) => ({
                        ...current,
                        consent: event.target.checked,
                        termsAccepted: event.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 accent-black"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href={settings.terms.href}
                      className="link-underline text-ink"
                      target="_blank"
                    >
                      Terms &amp; Deposit Policy (version {settings.terms.version})
                    </Link>{" "}
                    and the{" "}
                    <Link href="/privacy" className="link-underline text-ink" target="_blank">
                      Privacy Policy
                    </Link>
                    , and to Hair &amp; Co contacting me about this booking.
                  </span>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="label inline-flex items-center border border-line px-5 py-4 hover:bg-mist"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white hover:bg-black disabled:cursor-wait disabled:opacity-50"
                  >
                    {submitting
                      ? settings.payments.enabled
                        ? "Redirecting…"
                        : "Booking…"
                      : settings.payments.enabled
                        ? "Pay deposit & confirm"
                        : "Confirm booking"}
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line p-6">
            <p className="label text-muted">Your appointment</p>
            <div className="mt-5 space-y-4 border-t border-line pt-5 text-sm">
              <div>
                <p className="label mb-1 text-muted">Service</p>
                <p className="font-serif text-xl leading-tight">
                  {service?.name ?? "Not selected"}
                </p>
              </div>
              <div>
                <p className="label mb-1 text-muted">Date</p>
                <p>{date ? formatDateLong(date) : "Not selected"}</p>
              </div>
              <div>
                <p className="label mb-1 text-muted">Time</p>
                <p>{time ? formatTime(time) : "Not selected"}</p>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="label text-muted">Service price</span>
                <span className="tabular-nums">
                  {service ? (
                    <ServicePrice
                      priceCents={service.priceCents}
                      salePriceCents={service.salePriceCents}
                      priceType={service.priceType}
                    />
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              {settings.payments.enabled && service ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="label text-muted">Deposit today</span>
                    <span className="tabular-nums">
                      {formatPrice(depositCents, "fixed")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="label text-muted">Balance in salon</span>
                    <span className="tabular-nums">
                      {formatPrice(balanceCents, "fixed")}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    {settings.payments.depositNote}
                    {service.priceType === "from"
                      ? " The final price and balance are confirmed in the salon."
                      : ""}
                  </p>
                </>
              ) : (
                <p className="text-xs leading-relaxed text-muted">
                  Pay in salon. {settings.booking.policyNote}
                </p>
              )}
            </div>
            <a
              href={`tel:${settings.contact.phoneE164}`}
              className="label mt-6 flex items-center justify-between border-t border-line pt-4 text-muted hover:text-ink"
            >
              Need help? {settings.contact.phoneDisplay}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
