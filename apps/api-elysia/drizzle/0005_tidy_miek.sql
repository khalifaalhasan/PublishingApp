ALTER TABLE "submission" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "submission" ALTER COLUMN "status" SET DEFAULT 'AWAITING_REVIEW'::text;--> statement-breakpoint
ALTER TABLE "submission_status_history" ALTER COLUMN "from_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "submission_status_history" ALTER COLUMN "to_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."submission_status";--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."submission_status" AS ENUM('AWAITING_REVIEW', 'IN_REVIEW', 'ACTION_REQUIRED', 'RESUBMITTED', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "submission" ALTER COLUMN "status" SET DEFAULT 'AWAITING_REVIEW'::"public"."submission_status";--> statement-breakpoint
ALTER TABLE "submission" ALTER COLUMN "status" SET DATA TYPE "public"."submission_status" USING "status"::"public"."submission_status";--> statement-breakpoint
ALTER TABLE "submission_status_history" ALTER COLUMN "from_status" SET DATA TYPE "public"."submission_status" USING "from_status"::"public"."submission_status";--> statement-breakpoint
ALTER TABLE "submission_status_history" ALTER COLUMN "to_status" SET DATA TYPE "public"."submission_status" USING "to_status"::"public"."submission_status";