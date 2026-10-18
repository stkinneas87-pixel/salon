import Image from "next/image";
import Link from "next/link";

import type { SiteSettings } from "@/lib/content/schemas";
import { formatClosedDays, formatHoursSummary } from "@/lib/utils";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-ink text-white">
      <div className="container-editorial py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.6fr_1fr]">
          <div>
            <Link href="/" aria-label={`${settings.brand.name} home`}>
              <Image
                src="/brand/wordmark-white.png"
                alt={settings.brand.name}
                width={836}
                height={130}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
              {settings.footer.tagline}
            </p>
            <p className="label mt-8 text-white/55">Newport · Sydney</p>
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            <Link href="/" className="text-sm text-white/65 hover:text-white">
              Home
            </Link>
            <Link href="/about" className="text-sm text-white/65 hover:text-white">
              About
            </Link>
            <Link href="/services" className="text-sm text-white/65 hover:text-white">
              Services
            </Link>
            <Link href="/contact" className="text-sm text-white/65 hover:text-white">
              Contact
            </Link>
            <Link href="/book" className="text-sm text-white/65 hover:text-white">
              Book
            </Link>
            <Link href="/privacy" className="text-sm text-white/65 hover:text-white">
              Privacy
            </Link>
          </nav>

          <div className="space-y-5 text-sm text-white/65">
            <div>
              <p className="label mb-2 text-white/55">Visit</p>
              <a
                href={settings.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                {settings.contact.addressLine1}
                <br />
                {settings.contact.addressLine2}
              </a>
            </div>
            <div>
              <p className="label mb-2 text-white/55">Call</p>
              <a
                href={`tel:${settings.contact.phoneE164}`}
                className="link-underline"
              >
                {settings.contact.phoneDisplay}
              </a>
              {settings.contact.email ? (
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="mt-1 block break-all text-white/65 hover:text-white"
                >
                  {settings.contact.email}
                </a>
              ) : null}
            </div>
            <div>
              <p className="label mb-2 text-white/55">Hours</p>
              <p>{formatHoursSummary(settings.hours)}</p>
              {formatClosedDays(settings.hours) ? (
                <p className="mt-1 text-white/60">
                  {formatClosedDays(settings.hours)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a
                href={settings.contact.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="label inline-flex items-center gap-2 text-white/70 hover:text-white"
              >
                Facebook <span aria-hidden="true">↗</span>
              </a>
              {settings.contact.whatsappUrl ? (
                <a
                  href={settings.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="label inline-flex items-center gap-2 text-white/70 hover:text-white"
                >
                  WhatsApp <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.footer.copyright}</p>
          <p>{settings.contact.addressFull}</p>
        </div>
      </div>
    </footer>
  );
}
