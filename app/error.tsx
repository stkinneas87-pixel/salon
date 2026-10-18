"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <p className="label text-muted">Something went wrong</p>
      <h1 className="display mt-6 text-5xl lg:text-7xl">Please try again.</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
        We couldn&apos;t load this page. You can retry, or call the salon on +61
        412 601 878.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="label bg-ink px-5 py-4 text-white hover:bg-black"
        >
          Try again
        </button>
        <Link
          href="/"
          className="label border border-line px-5 py-4 hover:bg-ink hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
