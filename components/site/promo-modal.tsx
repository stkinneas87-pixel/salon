"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { PublicPromotion } from "@/lib/content/queries";
import { formatDateRange, formatDuration } from "@/lib/utils";

import { ServicePrice } from "./service-price";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5" />
      <path d="M3.75 9.75h16.5M8.25 3.75v3M15.75 3.75v3" />
    </svg>
  );
}

const HIDDEN_KEY = "hairco_promo_hidden_date";

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function readHiddenDate() {
  try {
    return window.localStorage.getItem(HIDDEN_KEY);
  } catch {
    return null;
  }
}

function writeHiddenDate(value: string | null) {
  try {
    if (value) window.localStorage.setItem(HIDDEN_KEY, value);
    else window.localStorage.removeItem(HIDDEN_KEY);
  } catch {
    // Private browsing/storage denial: the modal still works for this visit.
  }
}

export function PromoModal({ promos }: { promos: PublicPromotion[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    if (!promos.length) return;

    const hiddenDate = readHiddenDate();
    if (hiddenDate === todayKey()) return;

    const timer = window.setTimeout(() => {
      setIndex(0);
      setImageIndex(0);
      setDontShowToday(false);
      setOpen(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [promos.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!promos.length) return null;

  const promo = promos[index] ?? promos[0];
  const multiple = promos.length > 1;
  const images = promo.images;
  const currentImage = images[imageIndex] ?? images[0];
  const multipleImages = images.length > 1;
  const period = formatDateRange(
    promo.startDate,
    promo.unlimited ? null : promo.endDate,
  );

  function close() {
    setOpen(false);
  }

  function go(direction: -1 | 1) {
    setIndex((current) => (current + direction + promos.length) % promos.length);
    setImageIndex(0);
  }

  function goToPromo(nextIndex: number) {
    setIndex(nextIndex);
    setImageIndex(0);
  }

  function goToImage(direction: -1 | 1) {
    setImageIndex(
      (current) => (current + direction + images.length) % images.length,
    );
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (!multiple) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  function handleDontShow(checked: boolean) {
    setDontShowToday(checked);
    writeHiddenDate(checked ? todayKey() : null);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="promo-modal-title"
      aria-describedby="promo-modal-description"
      onClose={() => setOpen(false)}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="m-auto max-h-[90dvh] w-[calc(100vw-2rem)] max-w-5xl overflow-hidden border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close promotion"
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center border border-white/40 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black"
      >
        <span className="relative h-4 w-4">
          <span className="absolute top-1/2 left-0 h-px w-4 rotate-45 bg-current" />
          <span className="absolute top-1/2 left-0 h-px w-4 -rotate-45 bg-current" />
        </span>
      </button>

      <div className="grid max-h-[90dvh] grid-rows-[38vh_minmax(0,1fr)] lg:h-[min(680px,90dvh)] lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-1">
        <div className="relative min-h-0 overflow-hidden bg-mist lg:h-full">
          {currentImage ? (
            <Image
              key={`${promo.id}-${currentImage.src}`}
              src={currentImage.src}
              alt={currentImage.alt || promo.title}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          ) : null}

          {multiple ? (
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-2 text-[10px] tracking-[0.18em] text-white uppercase backdrop-blur-sm">
              {index + 1} / {promos.length}
            </div>
          ) : null}

          {multipleImages ? (
            <>
              <button
                type="button"
                onClick={() => goToImage(-1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => goToImage(1)}
                aria-label="Next image"
                className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black"
              >
                →
              </button>
              <div className="absolute right-4 bottom-4 bg-black/60 px-3 py-2 text-[10px] tracking-[0.18em] text-white uppercase backdrop-blur-sm">
                {imageIndex + 1} / {images.length}
              </div>
              <div
                className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5"
                aria-label="Promotion images"
              >
                {images.map((image, dotIndex) => (
                  <button
                    key={`${image.src}-${dotIndex}`}
                    type="button"
                    onClick={() => setImageIndex(dotIndex)}
                    aria-label={`Show image ${dotIndex + 1}`}
                    aria-current={dotIndex === imageIndex ? "true" : undefined}
                    className={`h-1.5 transition-all motion-reduce:transition-none ${
                      dotIndex === imageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/45 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8 lg:p-10">
          <p className="label text-muted">
            {promo.kicker || "A little something from Hair & Co"}
          </p>

          <h2
            id="promo-modal-title"
            className="display mt-5 text-[clamp(2.5rem,5vw,4.5rem)]"
          >
            {promo.title}
          </h2>

          <p
            id="promo-modal-description"
            className="pretty mt-5 max-w-lg text-sm leading-relaxed text-muted lg:text-base"
          >
            {promo.description}
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-line py-4">
            <p className="font-serif text-2xl leading-none">
              {promo.serviceName}
            </p>
            <p className="text-sm tabular-nums">
              <ServicePrice
                priceCents={promo.priceCents}
                salePriceCents={promo.salePriceCents}
                priceType={promo.priceType}
              />
            </p>
            <p className="label text-muted">
              {formatDuration(promo.durationMinutes)}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 border border-line bg-mist px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-paper">
              <CalendarIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="label text-muted">Offer period</p>
              <p className="mt-1 text-sm leading-snug tabular-nums">{period}</p>
            </div>
            {promo.unlimited ? (
              <span className="label shrink-0 border border-ink/15 bg-paper px-2 py-1 text-muted">
                Ongoing
              </span>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/book?service=${promo.serviceSlug}`}
              onClick={close}
              prefetch={false}
              className="label inline-flex items-center justify-between gap-8 bg-ink px-5 py-4 text-white transition-colors hover:bg-black"
            >
              Book this service <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href={`/services#${promo.serviceSlug}`}
              onClick={close}
              className="label inline-flex items-center justify-between gap-8 border border-line px-5 py-4 transition-colors hover:bg-ink hover:text-white"
            >
              View service <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="mt-auto pt-8">
            {multiple ? (
              <div className="flex items-center justify-between border-t border-line pt-4">
                <div className="flex items-center gap-1.5" aria-label="Promotions">
                  {promos.map((item, dotIndex) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToPromo(dotIndex)}
                      aria-label={`Show promotion ${dotIndex + 1}: ${item.title}`}
                      aria-current={dotIndex === index ? "true" : undefined}
                      className={`h-1.5 transition-all motion-reduce:transition-none ${
                        dotIndex === index
                          ? "w-7 bg-ink"
                          : "w-1.5 bg-ink/25 hover:bg-ink/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="label mr-2 text-muted" aria-live="polite">
                    {index + 1} / {promos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous promotion"
                    className="flex h-9 w-9 items-center justify-center border border-line text-sm hover:bg-mist"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next promotion"
                    className="flex h-9 w-9 items-center justify-center border border-line text-sm hover:bg-mist"
                  >
                    →
                  </button>
                </div>
              </div>
            ) : null}

            <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-xs leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(event) => handleDontShow(event.target.checked)}
                className="h-3.5 w-3.5 accent-black"
              />
              Don&apos;t show this again today
            </label>
          </div>
        </div>
      </div>
    </dialog>
  );
}
