"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { SiteSettings } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

type HeaderSettings = Pick<SiteSettings, "brand" | "contact">;

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: HeaderSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openMenu() {
    dialogRef.current?.showModal();
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-colors duration-300",
          scrolled ? "border-line" : "border-transparent",
        )}
        style={{ height: "var(--header-height)" }}
      >
        <div className="container-editorial flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${settings.brand.name} home`}
          >
            <Image
              src={settings.brand.logo.src}
              alt=""
              width={settings.brand.logo.width ?? 1024}
              height={settings.brand.logo.height ?? 1024}
              className="hidden h-9 w-9 sm:block"
              sizes="36px"
            />
            <Image
              src={settings.brand.wordmark.src}
              alt={settings.brand.wordmark.alt}
              width={settings.brand.wordmark.width ?? 836}
              height={settings.brand.wordmark.height ?? 130}
              className="h-[17px] w-auto sm:h-[18px]"
              sizes="(max-width: 640px) 100px, 140px"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="label link-underline text-ink/75 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="label hidden bg-ink px-5 py-3 text-white transition-colors hover:bg-black sm:inline-flex"
            >
              Book
            </Link>
            <button
              type="button"
              onClick={openMenu}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-line md:hidden"
              aria-label="Open menu"
            >
              <span className="block h-px w-5 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-white backdrop:bg-black/60 md:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
      >
        <div className="flex min-h-dvh flex-col p-6">
          <div className="flex items-center justify-between">
            <Image
              src="/brand/wordmark-white.png"
              alt={settings.brand.name}
              width={836}
              height={130}
              className="h-5 w-auto"
            />
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center border border-white/25"
              aria-label="Close menu"
            >
              <span className="relative block h-4 w-4">
                <span className="absolute top-1/2 left-0 h-px w-4 rotate-45 bg-white" />
                <span className="absolute top-1/2 left-0 h-px w-4 -rotate-45 bg-white" />
              </span>
            </button>
          </div>

          <nav className="mt-16 flex flex-col" aria-label="Mobile">
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="display border-b border-white/15 py-4 text-5xl italic"
              >
                <span className="mr-4 align-middle font-sans text-[10px] not-italic tracking-widest text-white/40">
                  0{index + 1}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-5 pt-12">
            <Link
              href="/book"
              onClick={closeMenu}
              className="label flex items-center justify-between border border-white/30 px-5 py-4 text-white"
            >
              Book an appointment <span aria-hidden="true">↗</span>
            </Link>
            <div className="space-y-1 text-sm text-white/65">
              <a href={`tel:${settings.contact.phoneE164}`} className="block">
                {settings.contact.phoneDisplay}
              </a>
              {settings.contact.whatsappUrl ? (
                <a
                  href={settings.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-white"
                >
                  WhatsApp <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              <p>{settings.contact.addressFull}</p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
