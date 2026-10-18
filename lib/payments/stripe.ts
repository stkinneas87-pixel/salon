import "server-only";

import Stripe from "stripe";

export type StripeMode = "test" | "live" | "not_configured" | "invalid";

let stripeClient: Stripe | null = null;

function secretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function getStripeMode(): StripeMode {
  const key = secretKey();
  if (!key) return "not_configured";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return "invalid";
}

function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

export function stripeModeIsAllowed() {
  const mode = getStripeMode();
  if (mode === "not_configured" || mode === "invalid") return false;

  if (isProductionDeployment()) {
    return mode === "live";
  }

  return mode === "test";
}

export function getStripeModeMessage() {
  if (!secretKey()) return "Stripe is not configured.";
  if (getStripeMode() === "invalid") {
    return "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.";
  }
  if (!stripeModeIsAllowed()) {
    return isProductionDeployment()
      ? "Production requires a live Stripe key. Test keys are blocked on the live site."
      : "This environment only accepts Stripe test keys. Live keys are blocked outside production.";
  }
  return null;
}

export function isStripeConfigured() {
  return Boolean(
    secretKey() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      stripeModeIsAllowed(),
  );
}

export function getStripe() {
  const key = secretKey();
  const message = getStripeModeMessage();
  if (!key || message) {
    throw new Error(message || "Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  return secret;
}
