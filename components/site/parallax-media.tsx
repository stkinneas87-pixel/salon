"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type Item = {
  frame: HTMLElement;
  layer: HTMLElement;
  speed: number;
  active: boolean;
};

const items = new Set<Item>();
let mediaQuery: MediaQueryList | null = null;
let frameRequest = 0;
let listening = false;

function resetItem(item: Item) {
  item.layer.style.setProperty("--parallax-y", "0px");
}

function update() {
  frameRequest = 0;
  if (typeof window === "undefined") return;
  if (mediaQuery?.matches) {
    items.forEach(resetItem);
    return;
  }

  const viewport = window.innerHeight;
  const active = Array.from(items).filter((item) => item.active);
  const measurements = active.map((item) => ({
    item,
    rect: item.frame.getBoundingClientRect(),
  }));

  for (const { item, rect } of measurements) {
    const offset = (rect.top + rect.height / 2 - viewport / 2) * item.speed;
    const clamped = Math.max(-120, Math.min(120, offset));
    item.layer.style.setProperty("--parallax-y", `${clamped.toFixed(2)}px`);
  }
}

function schedule() {
  if (frameRequest) return;
  frameRequest = window.requestAnimationFrame(update);
}

function onMediaChange() {
  items.forEach(resetItem);
  if (!mediaQuery?.matches) schedule();
}

function ensureListeners() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  mediaQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce), (max-width: 767px)",
  );
  mediaQuery.addEventListener("change", onMediaChange);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function register(frame: HTMLElement, layer: HTMLElement, speed: number) {
  ensureListeners();
  const item: Item = { frame, layer, speed, active: false };

  if (!("IntersectionObserver" in window)) {
    resetItem(item);
    return () => {};
  }

  items.add(item);

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      item.active = Boolean(entry?.isIntersecting);
      if (item.active) schedule();
      else resetItem(item);
    },
    { rootMargin: "20% 0px" },
  );
  observer.observe(frame);

  return () => {
    observer.disconnect();
    items.delete(item);
    resetItem(item);
  };
}

export function ParallaxMedia({
  src,
  alt,
  speed = 0.08,
  className,
  imageClassName,
  sizes = "100vw",
  priority = false,
  overlay = false,
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  overlay?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frameRef.current || !layerRef.current) return;
    return register(frameRef.current, layerRef.current, speed);
  }, [speed]);

  const isAbsolute = className?.split(/\s+/).includes("absolute") ?? false;

  return (
    <div
      ref={frameRef}
      className={cn("parallax-frame", !isAbsolute && "relative", className)}
    >
      <div ref={layerRef} className="parallax-layer absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover salon-image", imageClassName)}
        />
      </div>
      {overlay ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      ) : null}
    </div>
  );
}
