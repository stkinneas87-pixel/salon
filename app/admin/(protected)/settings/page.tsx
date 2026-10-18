import Link from "next/link";
import { connection } from "next/server";

import { SettingsForm } from "@/components/admin/settings-form";
import { getPage } from "@/lib/content/queries";
import { getSettingsForAdmin } from "@/lib/db/queries";
import {
  getStripeMode,
  isStripeConfigured,
} from "@/lib/payments/stripe";

export default async function AdminSettingsPage() {
  await connection();
  const [settings, privacy, terms] = await Promise.all([
    getSettingsForAdmin(),
    getPage("privacy"),
    getPage("terms"),
  ]);
  const stripeMode = getStripeMode();
  const stripeConfigured = isStripeConfigured();
  const privacyText = privacy.content.paragraphs.join(" ");
  const termsText = terms.content.sections
    .flatMap((section) => [section.title, ...section.paragraphs])
    .join(" ");
  const legalWarning =
    settings.payments.enabled &&
    (!privacyText.toLowerCase().includes("stripe") ||
      termsText.toLowerCase().includes("available on request") ||
      termsText.includes("[add"));

  return (
    <div>
      {legalWarning ? (
        <div className="mx-auto mb-5 max-w-5xl border border-ink/30 bg-mist px-4 py-3 text-sm leading-relaxed">
          <strong>Review the legal pages before taking live deposits.</strong>{" "}
          Add the real ABN/business details to Terms, mention Stripe in the
          Privacy Policy, and have an Australian lawyer review both pages.
          <div className="mt-2 flex gap-3 text-xs">
            <Link href="/admin/content/terms" className="underline">
              Edit Terms
            </Link>
            <Link href="/admin/content/privacy" className="underline">
              Edit Privacy
            </Link>
          </div>
        </div>
      ) : null}
      {settings.payments.enabled && !stripeConfigured ? (
        <div className="mx-auto mb-5 max-w-5xl border border-ink/20 bg-mist px-4 py-3 text-sm">
          <strong>Stripe is enabled but not configured.</strong> Online booking
          is blocked. Add <code className="bg-white px-1">STRIPE_SECRET_KEY</code>{" "}
          and <code className="bg-white px-1">STRIPE_WEBHOOK_SECRET</code> in
          Vercel, then redeploy.
        </div>
      ) : null}
      {settings.payments.enabled && stripeMode === "test" ? (
        <div className="mx-auto mb-5 max-w-5xl border border-ink/20 bg-white px-4 py-3 text-sm">
          <strong>Stripe test mode.</strong> Deposits use test cards and no real
          money. Use live keys before launch.
        </div>
      ) : null}
      <SettingsForm settings={settings} />
    </div>
  );
}
