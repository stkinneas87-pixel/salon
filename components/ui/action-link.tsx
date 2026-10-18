import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "light" | "plain";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-white hover:bg-black",
  outline: "border border-line text-ink hover:bg-ink hover:text-white",
  light: "border border-white/30 text-white hover:bg-white hover:text-ink",
  plain: "border-b border-current pb-1 text-ink hover:opacity-60",
};

export function ActionLink({
  href,
  children,
  variant = "solid",
  className,
  external,
  arrow = true,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  arrow?: boolean;
}) {
  const classes = cn(
    "label inline-flex items-center justify-between gap-10 transition-colors duration-300",
    variant !== "plain" && "px-5 py-4",
    variants[variant],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {arrow ? <span aria-hidden="true">↗</span> : null}
    </>
  );

  const isExternal = external || /^https?:\/\//i.test(href);

  if (isExternal || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
