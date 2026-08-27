CREATE TABLE "ash_exit" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_id" uuid NOT NULL,
	"age_at_exit" integer NOT NULL,
	"school_name" text NOT NULL,
	"class_at_exit" text NOT NULL,
	"duration_in_program" text NOT NULL,
	"exit_reason" text NOT NULL,
	"academic_impact_rating" integer NOT NULL,
	"areas_of_improvement" text[],
	"mentorship_received" text NOT NULL,
	"mentorship_impact_rating" integer,
	"post_ash_status" text NOT NULL,
	"institution_name" text,
	"course_of_study" text,
	"vocational_skill" text,
	"enjoyed_most" text,
	"program_impact" text,
	"improvement_suggestions" text,
	"facilitator_name" text NOT NULL,
	"exit_date" date NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_exit_age_check" CHECK ("ash_exit"."age_at_exit" >= 6 AND "ash_exit"."age_at_exit" <= 18),
	CONSTRAINT "ash_exit_academic_impact_rating_check" CHECK ("ash_exit"."academic_impact_rating" >= 1 AND "ash_exit"."academic_impact_rating" <= 10),
	CONSTRAINT "ash_exit_mentorship_impact_rating_check" CHECK ("ash_exit"."mentorship_impact_rating" >= 1 AND "ash_exit"."mentorship_impact_rating" <= 10)
);
--> statement-breakpoint
CREATE TABLE "ash_online_registration" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"child_first_name" text NOT NULL,
	"child_surname" text NOT NULL,
	"dob" date NOT NULL,
	"age" integer NOT NULL,
	"childClass" text NOT NULL,
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
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_online_age_check" CHECK ("ash_online_registration"."age" >= 3 AND "ash_online_registration"."age" <= 17)
);
--> statement-breakpoint
CREATE TABLE "ash_program_feedback" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_first_name" text NOT NULL,
	"student_surname" text NOT NULL,
	"school_name" text NOT NULL,
	"current_class" text NOT NULL,
	"attendance_frequency" text NOT NULL,
	"enjoyed_parts" text[],
	"learning_improvement_rating" integer NOT NULL,
	"confidence_rating" integer NOT NULL,
	"volunteer_support_rating" integer NOT NULL,
	"student_enjoyed_most" text,
	"student_improvement_suggestions" text,
	"parent_guardian_name" text NOT NULL,
	"parent_guardian_relationship" text NOT NULL,
	"parent_phone" text,
	"child_benefited" text NOT NULL,
	"academic_improvement_noticed" text,
	"confidence_behavior_change" text,
	"most_valuable_aspects" text[],
	"parent_satisfaction_rating" integer,
	"program_impact_on_child" text,
	"parent_improvement_suggestions" text,
	"additional_comments" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_feedback_learning_improvement_check" CHECK ("ash_program_feedback"."learning_improvement_rating" >= 1 AND "ash_program_feedback"."learning_improvement_rating" <= 5),
	CONSTRAINT "ash_feedback_confidence_check" CHECK ("ash_program_feedback"."confidence_rating" >= 1 AND "ash_program_feedback"."confidence_rating" <= 5),
	CONSTRAINT "ash_feedback_volunteer_support_check" CHECK ("ash_program_feedback"."volunteer_support_rating" >= 1 AND "ash_program_feedback"."volunteer_support_rating" <= 5),
	CONSTRAINT "ash_feedback_parent_satisfaction_check" CHECK ("ash_program_feedback"."parent_satisfaction_rating" >= 1 AND "ash_program_feedback"."parent_satisfaction_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "ash_student" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"surname" text NOT NULL,
	"gender" text NOT NULL,
	"age" integer NOT NULL,
	"dob" date NOT NULL,
	"primary_language" text NOT NULL,
	"home_address" text NOT NULL,
	"student_phone" text,
	"passport_photo_url" text NOT NULL,
	"passport_photo_public_id" text NOT NULL,
	"school_name" text NOT NULL,
	"school_town" text NOT NULL,
	"school_lga" text NOT NULL,
	"school_state" text NOT NULL,
	"current_class" text NOT NULL,
	"class_position_last_term" text NOT NULL,
	"last_result_url" text,
	"last_result_public_id" text,
	"prev_afterschool_program" text NOT NULL,
	"reason_for_joining" text NOT NULL,
	"fathers_name" text NOT NULL,
	"fathers_phone" text,
	"fathers_occupation" text NOT NULL,
	"mothers_name" text NOT NULL,
	"mothers_phone" text NOT NULL,
	"mothers_occupation" text,
	"guardian_name" text,
	"guardian_relationship" text,
	"guardian_phone" text,
	"guardian_occupation" text,
	"household_income_range" text,
	"has_learning_condition" text NOT NULL,
	"learning_conditions" text[],
	"parent_consent" boolean DEFAULT false NOT NULL,
	"declaration_confirmed" boolean DEFAULT false NOT NULL,
	"parent_signature_url" text NOT NULL,
	"parent_signature_public_id" text NOT NULL,
	"assigned_mentor" text,
	"pretest_score" numeric,
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_student_age_check" CHECK ("ash_student"."age" >= 6 AND "ash_student"."age" <= 18)
);
--> statement-breakpoint
CREATE TABLE "ash_termly_tracking" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_session" text NOT NULL,
	"term" text NOT NULL,
	"school_name" text NOT NULL,
	"school_numeracy_score" numeric,
	"school_literacy_score" numeric,
	"school_average" numeric,
	"school_position" text,
	"pretest_numeracy_score" numeric,
	"pretest_literacy_score" numeric,
	"pretest_average" numeric,
	"midtest_numeracy_score" numeric,
	"midtest_literacy_score" numeric,
	"midtest_average" numeric,
	"posttest_numeracy_score" numeric,
	"posttest_literacy_score" numeric,
	"posttest_average" numeric,
	"term_result_url" text NOT NULL,
	"term_result_public_id" text NOT NULL,
	"discipline_rating" integer NOT NULL,
	"responsibility_rating" integer NOT NULL,
	"leadership_rating" integer NOT NULL,
	"notable_achievements" text,
	"challenges_observed" text,
	"next_term_recommendations" text,
	"mentor_name" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "ash_termly_discipline_rating_check" CHECK ("ash_termly_tracking"."discipline_rating" >= 1 AND "ash_termly_tracking"."discipline_rating" <= 5),
	CONSTRAINT "ash_termly_responsibility_rating_check" CHECK ("ash_termly_tracking"."responsibility_rating" >= 1 AND "ash_termly_tracking"."responsibility_rating" <= 5),
	CONSTRAINT "ash_termly_leadership_rating_check" CHECK ("ash_termly_tracking"."leadership_rating" >= 1 AND "ash_termly_tracking"."leadership_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "ash_weekly_attendance" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"session_date" date NOT NULL,
	"students_in_attendance" uuid[] NOT NULL,
	"students_mentored" uuid[] NOT NULL,
	"sessions_conducted" text[],
	"session_details" text,
	"volunteers_in_attendance" text NOT NULL,
	"program_review" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "capacity_building_evaluation" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"program_name" text NOT NULL,
	"program_type" text NOT NULL,
	"program_date" date NOT NULL,
	"location" text NOT NULL,
	"program_coordinator" text NOT NULL,
	"number_of_sponsors" numeric NOT NULL,
	"list_of_sponsors" text NOT NULL,
	"sponsorship_type" text NOT NULL,
	"partner_organizations" text,
	"partnership_level" text NOT NULL,
	"number_of_participants" numeric NOT NULL,
	"target_audience" text NOT NULL,
	"number_of_facilitators" numeric NOT NULL,
	"number_of_volunteers" numeric NOT NULL,
	"participant_engagement_level" text NOT NULL,
	"program_objectives" text,
	"objective_achievement" text NOT NULL,
	"program_outcome" text,
	"program_impact" text,
	"major_activities" text,
	"effective_activities" text,
	"venue_suitability" numeric NOT NULL,
	"time_management" numeric NOT NULL,
	"resource_availability" numeric NOT NULL,
	"communication_and_coordination" numeric NOT NULL,
	"teamwork_among_organizers" numeric NOT NULL,
	"challenges_encountered" text,
	"challenges_addressed" text,
	"lessons_learned" text,
	"budget_allocated" text,
	"budget_utilized" text,
	"were_resources_adequate" text,
	"inadequate_resources_explanation" text,
	"overall_success" text,
	"recommend_the_program" text,
	"improvement_suggestions" text,
	"recommend_future_programs" text,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"date_submitted" date NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "capacity_venue_suitability_check" CHECK ("capacity_building_evaluation"."venue_suitability" >= 1 AND "capacity_building_evaluation"."venue_suitability" <= 5),
	CONSTRAINT "capacity_time_management_check" CHECK ("capacity_building_evaluation"."time_management" >= 1 AND "capacity_building_evaluation"."time_management" <= 5),
	CONSTRAINT "capacity_resource_availability_check" CHECK ("capacity_building_evaluation"."resource_availability" >= 1 AND "capacity_building_evaluation"."resource_availability" <= 5),
	CONSTRAINT "capacity_communication_coordination_check" CHECK ("capacity_building_evaluation"."communication_and_coordination" >= 1 AND "capacity_building_evaluation"."communication_and_coordination" <= 5),
	CONSTRAINT "capacity_teamwork_check" CHECK ("capacity_building_evaluation"."teamwork_among_organizers" >= 1 AND "capacity_building_evaluation"."teamwork_among_organizers" <= 5)
);
--> statement-breakpoint
CREATE TABLE "outreach_tracker" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"outreach_start_date" date NOT NULL,
	"outreach_end_date" date NOT NULL,
	"outreach_state" text NOT NULL,
	"outreach_lga" text NOT NULL,
	"outreach_city" text NOT NULL,
	"outreach_community" text NOT NULL,
	"num_volunteers" integer NOT NULL,
	"num_beneficiaries" integer NOT NULL,
	"outreach_type" text[] NOT NULL,
	"activity_description" text NOT NULL,
	"impact_stories" text,
	"challenges_encountered" text,
	"recommendations" text,
	"submitted_by" text NOT NULL,
	"submission_date" date NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "outreach_num_volunteers_check" CHECK ("outreach_tracker"."num_volunteers" >= 0),
	CONSTRAINT "outreach_num_beneficiaries_check" CHECK ("outreach_tracker"."num_beneficiaries" >= 0)
);
--> statement-breakpoint
CREATE TABLE "tacots_exit" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_id" uuid NOT NULL,
	"school_attended_during_program" text NOT NULL,
	"year_of_exit" integer NOT NULL,
	"exit_reason" text NOT NULL,
	"highest_education_attained" text NOT NULL,
	"current_status" text NOT NULL,
	"higher_institution_name" text,
	"higher_institution_city" text,
	"higher_institution_state" text,
	"employment_type" text,
	"vocational_skill" text,
	"new_school_name" text,
	"completed_secondary_elsewhere" text,
	"program_impact_description" text,
	"program_impact_rating" integer,
	"additional_situation_info" text,
	"completed_by" text NOT NULL,
	"submission_date" date NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tacots_exit_program_impact_rating_check" CHECK ("tacots_exit"."program_impact_rating" >= 1 AND "tacots_exit"."program_impact_rating" <= 10)
);
--> statement-breakpoint
CREATE TABLE "tacots_feedback" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_first_name" text NOT NULL,
	"student_surname" text NOT NULL,
	"current_school" text NOT NULL,
	"current_class" text NOT NULL,
	"scholarship_helped_stay" text NOT NULL,
	"most_helpful_support" text[],
	"study_motivation_rating" integer NOT NULL,
	"mentorship_impact_rating" integer NOT NULL,
	"current_challenges" text[],
	"liked_most" text,
	"student_improvement_suggestions" text,
	"parent_guardian_name" text NOT NULL,
	"parent_guardian_relationship" text NOT NULL,
	"parent_phone" text,
	"scholarship_reduced_burden" text NOT NULL,
	"academic_improvement_noticed" text,
	"attitude_change_noticed" text,
	"parent_satisfaction_rating" integer,
	"program_impact_on_family" text,
	"parent_improvement_suggestions" text,
	"additional_comments" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tacots_feedback_study_motivation_check" CHECK ("tacots_feedback"."study_motivation_rating" >= 1 AND "tacots_feedback"."study_motivation_rating" <= 5),
	CONSTRAINT "tacots_feedback_mentorship_impact_check" CHECK ("tacots_feedback"."mentorship_impact_rating" >= 1 AND "tacots_feedback"."mentorship_impact_rating" <= 5),
	CONSTRAINT "tacots_feedback_parent_satisfaction_check" CHECK ("tacots_feedback"."parent_satisfaction_rating" >= 1 AND "tacots_feedback"."parent_satisfaction_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "tacots_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_id" uuid NOT NULL,
	"onboarding_date" date NOT NULL,
	"has_mental_health_diagnosis" text NOT NULL,
	"diagnosed_conditions" text[],
	"behavioral_indicators" text[] NOT NULL,
	"focus_ability_rating" integer NOT NULL,
	"emotional_stability_rating" integer NOT NULL,
	"peer_interaction_rating" integer NOT NULL,
	"received_counseling" text NOT NULL,
	"needs_special_support" text NOT NULL,
	"mental_health_notes" text,
	"general_health_status" text NOT NULL,
	"immunization_status" text NOT NULL,
	"has_chronic_condition" text NOT NULL,
	"chronic_conditions" text[],
	"allergies" text[] NOT NULL,
	"requires_medication" text NOT NULL,
	"physical_activity_level" integer NOT NULL,
	"physical_limitations" text NOT NULL,
	"additional_health_notes" text,
	"enrolled_school_name" text NOT NULL,
	"enrolled_school_town" text NOT NULL,
	"enrolled_school_lga" text NOT NULL,
	"enrolled_school_state" text NOT NULL,
	"enrolled_class" text NOT NULL,
	"term_resumption_date" date NOT NULL,
	"school_fees_per_term" numeric,
	"student_commitment" boolean DEFAULT false,
	"parent_guardian_commitment" boolean DEFAULT false NOT NULL,
	"parent_signature_url" text,
	"parent_signature_public_id" text,
	"admission_letter_url" text,
	"admission_letter_url_public_id" text,
	"program_officer_notes" text,
	"support_types_approved" text[],
	"mentor_name" text,
	"sponsor_name" text,
	"additional_info" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tacots_onboarding_focus_ability_check" CHECK ("tacots_onboarding"."focus_ability_rating" >= 1 AND "tacots_onboarding"."focus_ability_rating" <= 5),
	CONSTRAINT "tacots_onboarding_emotional_stability_check" CHECK ("tacots_onboarding"."emotional_stability_rating" >= 1 AND "tacots_onboarding"."emotional_stability_rating" <= 5),
	CONSTRAINT "tacots_onboarding_peer_interaction_check" CHECK ("tacots_onboarding"."peer_interaction_rating" >= 1 AND "tacots_onboarding"."peer_interaction_rating" <= 5),
	CONSTRAINT "tacots_onboarding_physical_activity_check" CHECK ("tacots_onboarding"."physical_activity_level" >= 1 AND "tacots_onboarding"."physical_activity_level" <= 5)
);
--> statement-breakpoint
CREATE TABLE "tacots_recommendation" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"surname" text NOT NULL,
	"gender" text NOT NULL,
	"age" integer NOT NULL,
	"dob" date NOT NULL,
	"religion" text NOT NULL,
	"catholic_sacraments" text[],
	"parish_attended" text,
	"diocese" text,
	"primary_language" text NOT NULL,
	"phone_number" text,
	"nationality" text NOT NULL,
	"state_of_origin" text NOT NULL,
	"lga" text NOT NULL,
	"home_address" text NOT NULL,
	"school_name" text NOT NULL,
	"school_town" text NOT NULL,
	"school_state" text NOT NULL,
	"last_year_attended" integer NOT NULL,
	"last_class" text NOT NULL,
	"class_position_last_term" text NOT NULL,
	"last_term_average" numeric,
	"passport_photo_url" text NOT NULL,
	"passport_photo_public_id" text NOT NULL,
	"last_result_url" text NOT NULL,
	"last_result_public_id" text NOT NULL,
	"fathers_name" text NOT NULL,
	"fathers_occupation" text NOT NULL,
	"fathers_phone" text NOT NULL,
	"mothers_name" text NOT NULL,
	"mothers_occupation" text NOT NULL,
	"mothers_phone" text NOT NULL,
	"parents_address" text NOT NULL,
	"guardian_name" text,
	"guardian_phone" text,
	"guardian_relationship" text,
	"guardian_occupation" text,
	"guardian_address" text,
	"household_size" integer NOT NULL,
	"num_siblings" integer NOT NULL,
	"family_position" text NOT NULL,
	"special_circumstances" text NOT NULL,
	"annual_household_income" text NOT NULL,
	"income_sources" text[] NOT NULL,
	"num_income_earners" text NOT NULL,
	"avg_monthly_income" numeric,
	"lives_with" text NOT NULL,
	"residence_type" text NOT NULL,
	"has_electricity" text NOT NULL,
	"recommender_first_name" text NOT NULL,
	"recommender_last_name" text NOT NULL,
	"recommender_phone" text NOT NULL,
	"recommender_address" text NOT NULL,
	"child_background_notes" text NOT NULL,
	"support_types_needed" text[] NOT NULL,
	"other_important_info" text,
	"discipline_rating" integer NOT NULL,
	"responsibility_rating" integer NOT NULL,
	"career_goal" text NOT NULL,
	"student_statement" text,
	"declaration_confirmed" boolean DEFAULT false NOT NULL,
	"admin_status" text DEFAULT 'KEEP IN VIEW',
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tacots_recommendation_age_check" CHECK ("tacots_recommendation"."age" >= 6),
	CONSTRAINT "tacots_recommendation_household_size_check" CHECK ("tacots_recommendation"."household_size" >= 2),
	CONSTRAINT "tacots_recommendation_discipline_rating_check" CHECK ("tacots_recommendation"."discipline_rating" >= 1 AND "tacots_recommendation"."discipline_rating" <= 5),
	CONSTRAINT "tacots_recommendation_responsibility_rating_check" CHECK ("tacots_recommendation"."responsibility_rating" >= 1 AND "tacots_recommendation"."responsibility_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "tacots_tracking" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"student_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"region" text NOT NULL,
	"academic_session" text NOT NULL,
	"academic_term" text NOT NULL,
	"assessment_period" text NOT NULL,
	"submission_date" date NOT NULL,
	"highest_subject_score" text NOT NULL,
	"lowest_subject_score" text NOT NULL,
	"student_average_pct" numeric NOT NULL,
	"student_position_in_class" text NOT NULL,
	"term_result_url" text NOT NULL,
	"term_result_url_public_id" text NOT NULL,
	"academic_comment" text,
	"social_behavior_rating" integer NOT NULL,
	"school_rules_rating" integer NOT NULL,
	"responsibility_rating" integer NOT NULL,
	"formation_comments" text,
	"mentor_name" text NOT NULL,
	"mentorship_session_date" date NOT NULL,
	"mentorship_mode" text NOT NULL,
	"mentorship_duration" text NOT NULL,
	"mentorship_notes" text NOT NULL,
	"service_activity_type" text NOT NULL,
	"service_date" date NOT NULL,
	"service_duration" text NOT NULL,
	"service_description" text NOT NULL,
	"service_supervisor" text NOT NULL,
	"tuition_fee_paid" numeric NOT NULL,
	"resources_spent" numeric NOT NULL,
	"sundries_spent" numeric NOT NULL,
	"total_amount_spent" numeric NOT NULL,
	"payment_evidence_url" text,
	"payment_evidence_url_public_id" text,
	"financial_notes" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tacots_tracking_social_behavior_check" CHECK ("tacots_tracking"."social_behavior_rating" >= 1 AND "tacots_tracking"."social_behavior_rating" <= 5),
	CONSTRAINT "tacots_tracking_school_rules_check" CHECK ("tacots_tracking"."school_rules_rating" >= 1 AND "tacots_tracking"."school_rules_rating" <= 5),
	CONSTRAINT "tacots_tracking_responsibility_check" CHECK ("tacots_tracking"."responsibility_rating" >= 1 AND "tacots_tracking"."responsibility_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "volunteer_feedback" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"first_name" text NOT NULL,
	"surname" text NOT NULL,
	"program_volunteered" text NOT NULL,
	"specific_program_details" text,
	"volunteer_duration" text,
	"overall_experience_rating" integer NOT NULL,
	"role_clarity_rating" integer NOT NULL,
	"team_support_rating" integer NOT NULL,
	"organization_rating" integer NOT NULL,
	"program_made_impact" text,
	"ways_program_helped" text[],
	"activities_involved_in" text[],
	"skills_developed" text,
	"skills_gained" text[],
	"enjoyed_most" text,
	"challenges_experienced" text,
	"improvement_suggestions" text,
	"continue_volunteering" text,
	"would_recommend" text,
	"additional_comments" text,
	"submission_date" date NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "volunteer_feedback_overall_experience_check" CHECK ("volunteer_feedback"."overall_experience_rating" >= 1 AND "volunteer_feedback"."overall_experience_rating" <= 5),
	CONSTRAINT "volunteer_feedback_role_clarity_check" CHECK ("volunteer_feedback"."role_clarity_rating" >= 1 AND "volunteer_feedback"."role_clarity_rating" <= 5),
	CONSTRAINT "volunteer_feedback_team_support_check" CHECK ("volunteer_feedback"."team_support_rating" >= 1 AND "volunteer_feedback"."team_support_rating" <= 5),
	CONSTRAINT "volunteer_feedback_organization_check" CHECK ("volunteer_feedback"."organization_rating" >= 1 AND "volunteer_feedback"."organization_rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "volunteer_registration" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"surname" text NOT NULL,
	"gender" text NOT NULL,
	"dob" date NOT NULL,
	"age" integer NOT NULL,
	"phone_number" text NOT NULL,
	"email_address" text NOT NULL,
	"home_address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"occupation" text,
	"highest_education" text,
	"reason_for_volunteering" text NOT NULL,
	"volunteer_areas" text[] NOT NULL,
	"skills_to_contribute" text[],
	"availability" text[] NOT NULL,
	"commitment_duration" text,
	"ash_saturday_availability" text,
	"ash_academic_area" text,
	"ash_extracurricular" text[],
	"safeguarding_agreement" text NOT NULL,
	"media_consent" boolean DEFAULT false NOT NULL,
	"additional_info" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "volunteer_registration_age_check" CHECK ("volunteer_registration"."age" >= 16)
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "refreshtoken" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "refreshtoken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "rolepermissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "rolepermissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id"),
	CONSTRAINT "rolepermissions_role_id_permission_id_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "userroles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"description" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" text,
	CONSTRAINT "userroles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"department" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"document_url" text NOT NULL,
	"public_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"severity" text NOT NULL,
	"entity_type" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" text,
	"dismissed_at" timestamp,
	"resolved_at" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "notifications_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text DEFAULT 'https://res.cloudinary.com/dhdfwtjs5/image/upload/v1780649959/ongoing_project_result_raix7r.webp',
	"image_public_id" text DEFAULT 'ongoing_project_result_raix7r',
	"status" text DEFAULT 'ongoing',
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"amount_donated" numeric NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"support_areas" text[],
	"comment" text,
	"meta_data" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_forms" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"src" text NOT NULL,
	"description" text,
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "miscellaneous" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"number_of_photos" integer DEFAULT 266 NOT NULL,
	"number_of_partners" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"amount" numeric NOT NULL,
	"description" text,
	"uploaded_by" text NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ash_exit" ADD CONSTRAINT "ash_exit_student_id_ash_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ash_student"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ash_termly_tracking" ADD CONSTRAINT "ash_termly_tracking_student_id_ash_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."ash_student"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tacots_exit" ADD CONSTRAINT "tacots_exit_student_id_tacots_onboarding_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tacots_onboarding"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tacots_onboarding" ADD CONSTRAINT "tacots_onboarding_student_id_tacots_recommendation_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tacots_recommendation"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tacots_tracking" ADD CONSTRAINT "tacots_tracking_student_id_tacots_onboarding_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."tacots_onboarding"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tacots_tracking" ADD CONSTRAINT "tacots_tracking_school_id_tacots_onboarding_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."tacots_onboarding"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "refreshtoken" ADD CONSTRAINT "refreshtoken_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolepermissions" ADD CONSTRAINT "rolepermissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rolepermissions" ADD CONSTRAINT "rolepermissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "userroles" ADD CONSTRAINT "userroles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "userroles" ADD CONSTRAINT "userroles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ash_exit_student_idx" ON "ash_exit" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "ash_exit_school_idx" ON "ash_exit" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "ash_exit_age_idx" ON "ash_exit" USING btree ("age_at_exit");--> statement-breakpoint
CREATE INDEX "ash_exit_duration_idx" ON "ash_exit" USING btree ("duration_in_program");--> statement-breakpoint
CREATE INDEX "ash_exit_facilitator_idx" ON "ash_exit" USING btree ("facilitator_name");--> statement-breakpoint
CREATE INDEX "ash_exit_class_idx" ON "ash_exit" USING btree ("class_at_exit");--> statement-breakpoint
CREATE INDEX "ash_exit_date_idx" ON "ash_exit" USING btree ("exit_date");--> statement-breakpoint
CREATE INDEX "ash_exit_created_at_idx" ON "ash_exit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_exit_search_index" ON "ash_exit" USING gin ((
        setweight(to_tsvector('english', "school_name"), 'A') ||
        setweight(to_tsvector('english', "class_at_exit"), 'B') ||
        setweight(to_tsvector('english', "duration_in_program"), 'B') ||
        setweight(to_tsvector('english', "exit_reason"), 'C') ||
        setweight(array_to_tsvector(coalesce("areas_of_improvement", ARRAY[]::text[])), 'C')
      ));--> statement-breakpoint
CREATE INDEX "ash_online_child_name_idx" ON "ash_online_registration" USING btree ("child_first_name","child_surname");--> statement-breakpoint
CREATE INDEX "ash_online_childClass_idx" ON "ash_online_registration" USING btree ("childClass");--> statement-breakpoint
CREATE INDEX "ash_online_school_idx" ON "ash_online_registration" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "ash_online_child_email_idx" ON "ash_online_registration" USING btree ("child_email");--> statement-breakpoint
CREATE INDEX "ash_online_created_at_idx" ON "ash_online_registration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_online_search_index" ON "ash_online_registration" USING gin ((
        setweight(to_tsvector('english', "child_first_name"), 'A') ||
        setweight(to_tsvector('english', "child_surname"), 'A') ||
        setweight(to_tsvector('english', "childClass"), 'B') ||
        setweight(to_tsvector('english', "child_email"), 'B') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "time_availability"), 'B') ||
        setweight(array_to_tsvector(coalesce("tutoring_days", ARRAY[]::text[])), 'C') 
      ));--> statement-breakpoint
CREATE INDEX "ash_feedback_student_name_idx" ON "ash_program_feedback" USING btree ("student_first_name","student_surname");--> statement-breakpoint
CREATE INDEX "ash_feedback_school_idx" ON "ash_program_feedback" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "ash_feedback_class_idx" ON "ash_program_feedback" USING btree ("current_class");--> statement-breakpoint
CREATE INDEX "ash_feedback_parent_phone_idx" ON "ash_program_feedback" USING btree ("parent_phone");--> statement-breakpoint
CREATE INDEX "ash_feedback_created_at_idx" ON "ash_program_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_feedback_search_index" ON "ash_program_feedback" USING gin ((
        setweight(to_tsvector('english', "student_first_name"), 'A') ||
        setweight(to_tsvector('english', "student_surname"), 'A') ||
        setweight(to_tsvector('english', "school_name"), 'A') ||
        setweight(to_tsvector('english', "current_class"), 'B') ||
        setweight(to_tsvector('english', coalesce("parent_phone", '')), 'B') ||
        setweight(array_to_tsvector(coalesce("enjoyed_parts", ARRAY[]::text[])), 'C') ||
        setweight(array_to_tsvector(coalesce("most_valuable_aspects", ARRAY[]::text[])), 'C')
      ));--> statement-breakpoint
CREATE INDEX "ash_student_name_idx" ON "ash_student" USING btree ("first_name","surname");--> statement-breakpoint
CREATE INDEX "ash_student_status_idx" ON "ash_student" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ash_student_school_state_idx" ON "ash_student" USING btree ("school_state");--> statement-breakpoint
CREATE INDEX "ash_student_gender_idx" ON "ash_student" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "ash_student_current_class_idx" ON "ash_student" USING btree ("current_class");--> statement-breakpoint
CREATE INDEX "ash_student_assigned_mentor_idx" ON "ash_student" USING btree ("assigned_mentor");--> statement-breakpoint
CREATE INDEX "ash_student_created_at_idx" ON "ash_student" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_student_search_index" ON "ash_student" USING gin ((
        setweight(to_tsvector('english', "first_name"), 'A') ||
        setweight(to_tsvector('english', "surname"), 'A') ||
        setweight(to_tsvector('english', coalesce("middle_name", '')), 'A') ||
        setweight(to_tsvector('english', "current_class"), 'B') ||
        setweight(to_tsvector('english', coalesce("assigned_mentor", '')), 'B') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "school_state"), 'C') ||
        setweight(to_tsvector('english', "school_town"), 'C') ||
        setweight(to_tsvector('english', "school_lga"), 'C') ||
        setweight(array_to_tsvector(coalesce("learning_conditions", ARRAY[]::text[])), 'C')
      ));--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_student_idx" ON "ash_termly_tracking" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_session_term_idx" ON "ash_termly_tracking" USING btree ("academic_session","term");--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_school_idx" ON "ash_termly_tracking" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_mentor_idx" ON "ash_termly_tracking" USING btree ("mentor_name");--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_created_at_idx" ON "ash_termly_tracking" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_termly_tracking_search_index" ON "ash_termly_tracking" USING gin ((
        setweight(to_tsvector('english', "academic_session"), 'A') ||
        setweight(to_tsvector('english', "term"), 'A') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "mentor_name"), 'B') 
      ));--> statement-breakpoint
CREATE INDEX "ash_weekly_attendance_session_date_idx" ON "ash_weekly_attendance" USING btree ("session_date");--> statement-breakpoint
CREATE INDEX "ash_weekly_attendance_created_at_idx" ON "ash_weekly_attendance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ash_weekly_attendance_search_index" ON "ash_weekly_attendance" USING gin ((
        setweight(to_tsvector('english', "volunteers_in_attendance"), 'A') ||
        setweight(to_tsvector('english', coalesce("session_details", '')), 'A') ||
        setweight(array_to_tsvector(coalesce("sessions_conducted", ARRAY[]::text[])), 'A')
      ));--> statement-breakpoint
CREATE INDEX "capacity_program_name_idx" ON "capacity_building_evaluation" USING btree ("program_name");--> statement-breakpoint
CREATE INDEX "capacity_program_type_idx" ON "capacity_building_evaluation" USING btree ("program_type");--> statement-breakpoint
CREATE INDEX "capacity_program_date_idx" ON "capacity_building_evaluation" USING btree ("program_date");--> statement-breakpoint
CREATE INDEX "capacity_location_idx" ON "capacity_building_evaluation" USING btree ("location");--> statement-breakpoint
CREATE INDEX "capacity_coordinator_idx" ON "capacity_building_evaluation" USING btree ("program_coordinator");--> statement-breakpoint
CREATE INDEX "capacity_number_of_participants_idx" ON "capacity_building_evaluation" USING btree ("number_of_participants");--> statement-breakpoint
CREATE INDEX "capacity_date_submitted_idx" ON "capacity_building_evaluation" USING btree ("date_submitted");--> statement-breakpoint
CREATE INDEX "capacity_created_at_idx" ON "capacity_building_evaluation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "capacity_search_index" ON "capacity_building_evaluation" USING gin ((
        setweight(to_tsvector('english', "program_name"), 'A') ||
        setweight(to_tsvector('english', "program_type"), 'A') ||
        setweight(to_tsvector('english', "location"), 'A') ||
        setweight(to_tsvector('english', "program_coordinator"), 'A')
      ));--> statement-breakpoint
CREATE INDEX "outreach_tracker_period_idx" ON "outreach_tracker" USING btree ("outreach_start_date","outreach_end_date");--> statement-breakpoint
CREATE INDEX "outreach_tracker_location_idx" ON "outreach_tracker" USING btree ("outreach_state","outreach_lga","outreach_city");--> statement-breakpoint
CREATE INDEX "outreach_tracker_outreach_type_idx" ON "outreach_tracker" USING btree ("outreach_type");--> statement-breakpoint
CREATE INDEX "outreach_tracker_no_of_volunteers_idx" ON "outreach_tracker" USING btree ("num_volunteers");--> statement-breakpoint
CREATE INDEX "outreach_tracker_no_of_beneficiaries_idx" ON "outreach_tracker" USING btree ("num_beneficiaries");--> statement-breakpoint
CREATE INDEX "outreach_tracker_submitted_by_idx" ON "outreach_tracker" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "outreach_tracker_submission_date_idx" ON "outreach_tracker" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "outreach_tracker_created_at_idx" ON "outreach_tracker" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "outreach_tracker_search_index" ON "outreach_tracker" USING gin ((
        setweight(to_tsvector('english', "submitted_by"), 'A') ||
        setweight(array_to_tsvector(coalesce("outreach_type", ARRAY[]::text[])), 'A') ||
        setweight(to_tsvector('english', "outreach_state"), 'A') ||
        setweight(to_tsvector('english', "outreach_community"), 'A') ||
        setweight(to_tsvector('english', "outreach_city"), 'B') ||
        setweight(to_tsvector('english', "outreach_lga"), 'B') 
      ));--> statement-breakpoint
CREATE INDEX "tacots_exit_student_idx" ON "tacots_exit" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "tacots_exit_school_idx" ON "tacots_exit" USING btree ("school_attended_during_program");--> statement-breakpoint
CREATE INDEX "tacots_exit_year_idx" ON "tacots_exit" USING btree ("year_of_exit");--> statement-breakpoint
CREATE INDEX "tacots_exit_reason_idx" ON "tacots_exit" USING btree ("exit_reason");--> statement-breakpoint
CREATE INDEX "tacots_exit_submission_date_idx" ON "tacots_exit" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "tacots_exit_highest_education_attained_idx" ON "tacots_exit" USING btree ("highest_education_attained");--> statement-breakpoint
CREATE INDEX "tacots_exit_created_at_idx" ON "tacots_exit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tacots_exit_search_index" ON "tacots_exit" USING gin ((
        setweight(to_tsvector('english', "school_attended_during_program"), 'A') ||
        setweight(to_tsvector('english', "exit_reason"), 'C') ||
        setweight(to_tsvector('english', "current_status"), 'C') ||
        setweight(to_tsvector('english', "completed_by"), 'C') 
      ));--> statement-breakpoint
CREATE INDEX "tacots_feedback_student_name_idx" ON "tacots_feedback" USING btree ("student_first_name","student_surname");--> statement-breakpoint
CREATE INDEX "tacots_feedback_school_idx" ON "tacots_feedback" USING btree ("current_school");--> statement-breakpoint
CREATE INDEX "tacots_feedback_class_idx" ON "tacots_feedback" USING btree ("current_class");--> statement-breakpoint
CREATE INDEX "tacots_feedback_parent_phone_idx" ON "tacots_feedback" USING btree ("parent_phone");--> statement-breakpoint
CREATE INDEX "tacots_feedback_created_at_idx" ON "tacots_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tacots_feedback_search_index" ON "tacots_feedback" USING gin ((
        setweight(to_tsvector('english', "student_first_name"), 'A') ||
        setweight(to_tsvector('english', "student_surname"), 'A') ||
        setweight(to_tsvector('english', "current_class"), 'B') ||
        setweight(to_tsvector('english', "current_school"), 'A') ||
        setweight(to_tsvector('english', coalesce("parent_phone", '')), 'B') ||
        setweight(array_to_tsvector(coalesce("most_helpful_support", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("current_challenges", ARRAY[]::text[])), 'D')
      ));--> statement-breakpoint
CREATE INDEX "tacots_onboarding_student_idx" ON "tacots_onboarding" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_date_idx" ON "tacots_onboarding" USING btree ("onboarding_date");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_health_status_idx" ON "tacots_onboarding" USING btree ("general_health_status");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_school_idx" ON "tacots_onboarding" USING btree ("enrolled_school_name");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_school_state_idx" ON "tacots_onboarding" USING btree ("enrolled_school_state");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_class_idx" ON "tacots_onboarding" USING btree ("enrolled_class");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_created_at_idx" ON "tacots_onboarding" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tacots_onboarding_search_index" ON "tacots_onboarding" USING gin ((
        setweight(to_tsvector('english', "enrolled_school_name"), 'A') ||
        setweight(to_tsvector('english', "enrolled_school_state"), 'A') ||
        setweight(to_tsvector('english', "enrolled_class"), 'C') ||
        setweight(to_tsvector('english', "general_health_status"), 'C') ||
        setweight(to_tsvector('english', coalesce("mentor_name", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("sponsor_name", '')), 'B') ||
        setweight(array_to_tsvector(coalesce("diagnosed_conditions", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("chronic_conditions", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("support_types_approved", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("allergies", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("behavioral_indicators", ARRAY[]::text[])), 'D')
      ));--> statement-breakpoint
CREATE INDEX "tacots_recommendation_name_idx" ON "tacots_recommendation" USING btree ("first_name","surname");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_gender_idx" ON "tacots_recommendation" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_school_idx" ON "tacots_recommendation" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_last_class_idx" ON "tacots_recommendation" USING btree ("last_class");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_admin_status_idx" ON "tacots_recommendation" USING btree ("admin_status");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_created_at_idx" ON "tacots_recommendation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tacots_recommendation_search_index" ON "tacots_recommendation" USING gin ((
        setweight(to_tsvector('english', "first_name"), 'A') ||
        setweight(to_tsvector('english', "surname"), 'A') ||
        setweight(to_tsvector('english', "state_of_origin"), 'B') ||
        setweight(to_tsvector('english', "lga"), 'B') ||
        setweight(to_tsvector('english', "school_name"), 'B') ||
        setweight(to_tsvector('english', "last_class"), 'C') ||
        setweight(to_tsvector('english', "recommender_first_name"), 'C') ||
        setweight(to_tsvector('english', "recommender_last_name"), 'C') ||
        setweight(array_to_tsvector(coalesce("income_sources", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("support_types_needed", ARRAY[]::text[])), 'D') ||
        setweight(array_to_tsvector(coalesce("catholic_sacraments", ARRAY[]::text[])), 'D')
      ));--> statement-breakpoint
CREATE INDEX "tacots_tracking_student_idx" ON "tacots_tracking" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "tacots_tracking_school_idx" ON "tacots_tracking" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "tacots_tracking_region_idx" ON "tacots_tracking" USING btree ("region");--> statement-breakpoint
CREATE INDEX "tacots_tracking_student_average_idx" ON "tacots_tracking" USING btree ("student_average_pct");--> statement-breakpoint
CREATE INDEX "tacots_tracking_session_term_idx" ON "tacots_tracking" USING btree ("academic_session","academic_term");--> statement-breakpoint
CREATE INDEX "tacots_tracking_assessment_period_idx" ON "tacots_tracking" USING btree ("assessment_period");--> statement-breakpoint
CREATE INDEX "tacots_tracking_submission_date_idx" ON "tacots_tracking" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "tacots_tracking_mentorship_date_idx" ON "tacots_tracking" USING btree ("mentorship_session_date");--> statement-breakpoint
CREATE INDEX "tacots_tracking_service_date_idx" ON "tacots_tracking" USING btree ("service_date");--> statement-breakpoint
CREATE INDEX "tacots_tracking_created_at_idx" ON "tacots_tracking" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tacots_tracking_search_index" ON "tacots_tracking" USING gin ((
        setweight(to_tsvector('english', "academic_term"), 'A') ||
        setweight(to_tsvector('english', "assessment_period"), 'A') ||
        setweight(to_tsvector('english', "region"), 'B') ||
        setweight(to_tsvector('english', "mentor_name"), 'B') 
      ));--> statement-breakpoint
CREATE INDEX "volunteer_feedback_name_idx" ON "volunteer_feedback" USING btree ("first_name","surname");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_program_idx" ON "volunteer_feedback" USING btree ("program_volunteered");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_duration_idx" ON "volunteer_feedback" USING btree ("volunteer_duration");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_would_recommend_idx" ON "volunteer_feedback" USING btree ("would_recommend");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_submission_date_idx" ON "volunteer_feedback" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_created_at_idx" ON "volunteer_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "volunteer_feedback_search_index" ON "volunteer_feedback" USING gin ((
        setweight(to_tsvector('english', "first_name"), 'A') ||
        setweight(to_tsvector('english', "surname"), 'A') ||
        setweight(to_tsvector('english', "program_volunteered"), 'A') ||
        setweight(to_tsvector('english', coalesce("volunteer_duration", '')), 'A') ||
        setweight(array_to_tsvector(coalesce("ways_program_helped", ARRAY[]::text[])), 'C') ||
        setweight(array_to_tsvector(coalesce("activities_involved_in", ARRAY[]::text[])), 'C') ||
        setweight(array_to_tsvector(coalesce("skills_gained", ARRAY[]::text[])), 'C') ||
        setweight(to_tsvector('english', coalesce("would_recommend", '')), 'D') 
      ));--> statement-breakpoint
CREATE INDEX "volunteer_registration_name_idx" ON "volunteer_registration" USING btree ("first_name","surname");--> statement-breakpoint
CREATE INDEX "volunteer_registration_email_idx" ON "volunteer_registration" USING btree ("email_address");--> statement-breakpoint
CREATE INDEX "volunteer_registration_gender_idx" ON "volunteer_registration" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "volunteer_registration_state_idx" ON "volunteer_registration" USING btree ("state");--> statement-breakpoint
CREATE INDEX "volunteer_registration_status_idx" ON "volunteer_registration" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_registration_created_at_idx" ON "volunteer_registration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "volunteer_areas_idx" ON "volunteer_registration" USING gin ("volunteer_areas");--> statement-breakpoint
CREATE INDEX "availability_idx" ON "volunteer_registration" USING gin ("availability");--> statement-breakpoint
CREATE INDEX "volunteer_registration_search_index" ON "volunteer_registration" USING gin ((
        setweight(to_tsvector('english', "first_name"), 'A') ||
        setweight(to_tsvector('english', "surname"), 'A') ||
        setweight(to_tsvector('english', "email_address"), 'A') ||
        setweight(to_tsvector('english', "phone_number"), 'B') ||
        setweight(to_tsvector('english', "state"), 'B') ||
        setweight(array_to_tsvector(coalesce("skills_to_contribute", ARRAY[]::text[])), 'C') ||
        setweight(array_to_tsvector(coalesce("ash_extracurricular", ARRAY[]::text[])), 'C') ||
        setweight(array_to_tsvector(coalesce("volunteer_areas", ARRAY[]::text[])), 'C')
      ));--> statement-breakpoint
CREATE INDEX "permission_name_idx" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE INDEX "role_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_search_index" ON "users" USING gin ((
        setweight(to_tsvector('english', "name"), 'A') ||
        setweight(to_tsvector('english', "email"), 'A') ||
        setweight(to_tsvector('english', "department"), 'A')
      ));--> statement-breakpoint
CREATE INDEX "blog_search_index" ON "blogs" USING gin ((
        setweight(to_tsvector('english', "title"), 'A') ||
        setweight(to_tsvector('english', "description"), 'A') 
      ));--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_entity_type_idx" ON "notifications" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "donor_idx" ON "donors" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "donor_search_index" ON "donors" USING gin ((
          setweight(to_tsvector('english', "name"), 'A') ||
          setweight(to_tsvector('english', "email"), 'A') ||
          setweight(to_tsvector('english', coalesce("amount_donated"::text, '')), 'B') ||
          setweight(to_tsvector('english', coalesce("comment", '')), 'C') 
        ));--> statement-breakpoint
CREATE INDEX "photo_count_index" ON "miscellaneous" USING btree ("number_of_photos");--> statement-breakpoint
CREATE INDEX "partner_count_index" ON "miscellaneous" USING btree ("number_of_partners");--> statement-breakpoint
CREATE INDEX "receipts_name_idx" ON "receipts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "receipts_amount_idx" ON "receipts" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "receipts_description_idx" ON "receipts" USING btree ("description");--> statement-breakpoint
CREATE INDEX "receipts_uploadedBy_idx" ON "receipts" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "receipts_createdAt_idx" ON "receipts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "receipts_search_index" ON "receipts" USING gin ((
        setweight(to_tsvector('english', "name"), 'A') ||
        setweight(to_tsvector('english', "uploaded_by"), 'A') ||
        setweight(to_tsvector('english', coalesce("amount"::text, '')), 'B') ||
        setweight(to_tsvector('english', coalesce("description", '')), 'C') 
      ));