ALTER TABLE "promotions" ALTER COLUMN "image" SET DEFAULT '[]'::jsonb;
--> statement-breakpoint
UPDATE "promotions" SET "image" = jsonb_build_array("image") WHERE jsonb_typeof("image") = 'object';
