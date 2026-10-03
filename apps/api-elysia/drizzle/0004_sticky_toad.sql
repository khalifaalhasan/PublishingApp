ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "selling_point" text;
ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "cover_letter" text;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS "author_bio" jsonb;