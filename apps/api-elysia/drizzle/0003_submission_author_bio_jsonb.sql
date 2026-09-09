ALTER TABLE "submission" ALTER COLUMN "author_bio" TYPE jsonb USING jsonb_build_object('penName', "author_pen_name", 'bio', "author_bio", 'phone', "author_phone", 'socialLinks', "author_social_links");--> statement-breakpoint
ALTER TABLE "submission" DROP COLUMN "author_pen_name";--> statement-breakpoint
ALTER TABLE "submission" DROP COLUMN "author_phone";--> statement-breakpoint
ALTER TABLE "submission" DROP COLUMN "author_social_links";--> statement-breakpoint