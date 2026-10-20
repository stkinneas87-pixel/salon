ALTER TABLE "promotions" ADD COLUMN "start_date" date DEFAULT current_date NOT NULL;--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "promotions" ADD COLUMN "unlimited" boolean DEFAULT true NOT NULL;