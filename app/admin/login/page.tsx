import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Image
          src="/brand/wordmark-white.png"
          alt="Hair & Co"
          width={836}
          height={130}
          className="h-8 w-auto self-start"
          priority
        />
        <div>
          <p className="display max-w-md text-6xl text-white">
            The salon,
            <br />
            <span className="italic">behind the scenes.</span>
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/60">
            Manage pages, services, availability and bookings for Hair &amp; Co
            Newport.
          </p>
        </div>
        <p className="label text-white/50">Authorised access only</p>
      </div>

      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Image
              src="/brand/hair-and-co-mark.png"
              alt="Hair & Co"
              width={1024}
              height={1024}
              className="h-12 w-12"
              priority
            />
          </div>
          <p className="label mt-8 text-muted lg:mt-0">Admin</p>
          <h1 className="display mt-5 text-5xl">Welcome back.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Sign in with the admin credentials configured for this site.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <Link
            href="/"
            className="label mt-10 inline-flex text-muted hover:text-ink"
          >
            ← Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}
