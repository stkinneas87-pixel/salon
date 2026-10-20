"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const primary = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/availability", label: "Availability" },
];

const pages = [
  { href: "/admin/content/home", label: "Home" },
  { href: "/admin/content/about", label: "About" },
  { href: "/admin/content/services", label: "Services page" },
  { href: "/admin/content/contact", label: "Contact" },
  { href: "/admin/content/privacy", label: "Privacy" },
  { href: "/admin/content/terms", label: "Terms" },
];

export function AdminNav({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const linkClass = (href: string) =>
    cn(
      "label block py-2.5 transition-colors",
      variant === "sidebar"
        ? isActive(href)
          ? "text-white"
          : "text-white/65 hover:text-white"
        : isActive(href)
          ? "text-ink"
          : "text-muted hover:text-ink",
    );

  return (
    <nav
      aria-label="Admin"
      className={cn(
        variant === "sidebar" ? "space-y-7" : "flex gap-5 overflow-x-auto py-3",
      )}
    >
      <div className={variant === "mobile" ? "flex gap-5" : undefined}>
        {variant === "sidebar" ? (
          <p className="label mb-2 text-white/50">Salon</p>
        ) : null}
        {primary.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(linkClass(item.href), variant === "mobile" && "shrink-0")}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className={variant === "mobile" ? "flex gap-5" : undefined}>
        {variant === "sidebar" ? (
          <p className="label mb-2 text-white/50">Pages</p>
        ) : null}
        {pages.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(linkClass(item.href), variant === "mobile" && "shrink-0")}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div>
        {variant === "sidebar" ? (
          <p className="label mb-2 text-white/50">Site</p>
        ) : null}
        <Link
          href="/admin/settings"
          className={cn(linkClass("/admin/settings"), variant === "mobile" && "shrink-0 inline-block")}
        >
          Settings & SEO
        </Link>
      </div>
    </nav>
  );
}
