ALTER TABLE "ash_online_registration" RENAME COLUMN "class" TO "childClass";--> statement-breakpoint
DROP INDEX "ash_online_class_idx";--> statement-breakpoint
DROP INDEX "ash_online_search_index";--> statement-breakpoint
ALTER TABLE "ash_online_registration" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "ash_online_registration" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
CREATE INDEX "ash_online_childClass_idx" ON "ash_online_registration" USING btree ("childClass");--> statement-breakpoint
CREATE INDEX "ash_online_search_index" ON "ash_online_registration" USING gin ((
        setweight(to_tsvector('english', "child_first_name"), 'A') ||
        setweight(to_tsvector('english', "child_surname"), 'A') ||
        setweight(to_tsvector('english', "childClass"), 'B') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "tutoring_days"), 'B') ||
        setweight(array_to_tsvector(coalesce("time_availability", ARRAY[]::text[])), 'C') 
      ));