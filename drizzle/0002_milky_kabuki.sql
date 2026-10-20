CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"kicker" text DEFAULT '' NOT NULL,
	"description" text NOT NULL,
	"image" jsonb NOT NULL,
	"service_id" uuid NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promotions_active_sort_idx" ON "promotions" USING btree ("active","sort_order");