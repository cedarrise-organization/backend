CREATE TABLE "ash_online_registration" (
	"id" uuid PRIMARY KEY NOT NULL,
	"child_first_name" text NOT NULL,
	"child_surname" text NOT NULL,
	"dob" date NOT NULL,
	"age" integer NOT NULL,
	"class" text NOT NULL,
	"school_name" text NOT NULL,
	"school_location" text NOT NULL,
	"child_email" text NOT NULL,
	"tutoring_days" text[] NOT NULL,
	"time_availability" text NOT NULL,
	"subjects_of_interest" text[] NOT NULL,
	"current_curriculum_url" text,
	"current_curriculum_public_id" text,
	"academic_report_url" text,
	"academic_report_public_id" text,
	"prev_term_class_average" text NOT NULL,
	"prev_term_class_position" text NOT NULL,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"parent_email" text NOT NULL,
	"parental_consent" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_online_age_check" CHECK ("ash_online_registration"."age" >= 3 AND "ash_online_registration"."age" <= 17)
);
--> statement-breakpoint
CREATE INDEX "ash_online_child_name_idx" ON "ash_online_registration" USING btree ("child_first_name","child_surname");--> statement-breakpoint
CREATE INDEX "ash_online_class_idx" ON "ash_online_registration" USING btree ("class");--> statement-breakpoint
CREATE INDEX "ash_online_school_idx" ON "ash_online_registration" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "ash_online_child_email_idx" ON "ash_online_registration" USING btree ("child_email");--> statement-breakpoint
CREATE INDEX "ash_online_created_at_idx" ON "ash_online_registration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_online_search_index" ON "ash_online_registration" USING gin ((
        setweight(to_tsvector('english', "child_first_name"), 'A') ||
        setweight(to_tsvector('english', "child_surname"), 'A') ||
        setweight(to_tsvector('english', "class"), 'B') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "tutoring_days"), 'B') ||
        setweight(array_to_tsvector(coalesce("time_availability", ARRAY[]::text[])), 'C') 
      ));