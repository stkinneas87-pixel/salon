import Image from "next/image";
import Link from "next/link";

import { ActionLink } from "@/components/ui/action-link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <div className="container-editorial flex items-center justify-between border-b border-line py-5">
        <Link href="/" aria-label="Hair & Co home">
          <Image
            src="/brand/wordmark-black.png"
            alt="Hair & Co"
            width={836}
            height={130}
            className="h-5 w-auto"
          />
        </Link>
        <p className="label text-muted">404</p>
      </div>
      <div className="container-editorial flex flex-1 flex-col justify-center py-20">
        <p className="label text-muted">Page not found</p>
        <h1 className="display mt-6 max-w-3xl text-[clamp(4rem,10vw,10rem)]">
          This one got <span className="italic">cut.</span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
          The page you&apos;re looking for doesn&apos;t exist. Head back to the
          salon or book an appointment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ActionLink href="/">Back to home</ActionLink>
          <ActionLink href="/book" variant="outline" arrow={false}>
            Book an appointment
          </ActionLink>
        </div>
      </div>
    </main>
  );
}
