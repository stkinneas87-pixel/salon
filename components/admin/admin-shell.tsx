import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/actions/auth";

import { AdminNav } from "./admin-nav";

export function AdminShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col bg-ink p-7 text-white lg:flex">
        <Link href="/admin" aria-label="Admin home">
          <Image
            src="/brand/wordmark-white.png"
            alt="Hair & Co"
            width={836}
            height={130}
            className="h-7 w-auto"
          />
        </Link>
        <p className="label mt-3 text-white/50">Newport · Admin</p>

        <div className="mt-12 flex-1">
          <AdminNav />
        </div>

        <div className="space-y-4 border-t border-white/15 pt-5">
          <Link
            href="/"
            target="_blank"
            className="label flex items-center justify-between text-white/65 hover:text-white"
          >
            View site <span aria-hidden="true">↗</span>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="label flex w-full items-center justify-between text-white/65 hover:text-white"
            >
              Sign out <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="truncate text-xs text-white/50">Signed in as {username}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 lg:hidden">
          <Link href="/admin" aria-label="Admin home">
            <Image
              src="/brand/wordmark-black.png"
              alt="Hair & Co"
              width={836}
              height={130}
              className="h-5 w-auto"
            />
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="label text-muted">
              Sign out
            </button>
          </form>
        </header>
        <div className="border-b border-line bg-white px-5 lg:hidden">
          <AdminNav variant="mobile" />
        </div>

        <main className="p-5 sm:p-8 lg:p-10 xl:p-14">{children}</main>
      </div>
    </div>
  );
}
