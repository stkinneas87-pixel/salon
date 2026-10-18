CREATE TYPE "public"."payment_status" AS ENUM('not_required', 'pending', 'paid', 'refunded', 'failed', 'expired');--> statement-breakpoint
ALTER TYPE "public"."booking_status" ADD VALUE 'pending_payment' BEFORE 'confirmed';--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "deposit_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_status" "payment_status" DEFAULT 'not_required' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_session_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refunded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refund_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "refunded_by" text;--> statement-breakpoint
CREATE INDEX "bookings_payment_status_idx" ON "bookings" USING btree ("payment_status","payment_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_stripe_session_idx" ON "bookings" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "bookings_stripe_payment_intent_idx" ON "bookings" USING btree ("stripe_payment_intent_id");