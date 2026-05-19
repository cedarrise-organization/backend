import * as p from "drizzle-orm/pg-core";
import { index, primaryKey, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  updatedAt: p.timestamp("updated_at"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  deletedAt: p.timestamp("deleted_at"),
};

export const ashStudent = p.pgTable(
  "ash_student",
  {
    id: p.uuid().primaryKey().notNull(),

    programType: p.text("program_type").notNull(),
    firstName: p.text("first_name").notNull(),
    middleName: p.text("middle_name"),
    surname: p.text().notNull(),
    gender: p.text().notNull(),
    age: p.integer().notNull(),
    dob: p.date().notNull(),
    primaryLanguage: p.text("primary_language").notNull(),
    homeAddress: p.text("home_address").notNull(),
    studentPhone: p.text("student_phone"),
    passportPhotoUrl: p.text("passport_photo_url").notNull(),

    schoolName: p.text("school_name").notNull(),
    schoolTown: p.text("school_town").notNull(),
    schoolLga: p.text("school_lga").notNull(),
    schoolState: p.text("school_state").notNull(),
    currentClass: p.text("current_class").notNull(),
    classPositionLastTerm: p.text("class_position_last_term").notNull(),
    lastResultUrl: p.text("last_result_url"),

    prevAfterschoolProgram: p.text("prev_afterschool_program").notNull(),
    reasonForJoining: p.text("reason_for_joining").notNull(),

    fathersName: p.text("fathers_name").notNull(),
    fathersPhone: p.text("fathers_phone"),
    fathersOccupation: p.text("fathers_occupation").notNull(),
    mothersName: p.text("mothers_name").notNull(),
    mothersPhone: p.text("mothers_phone").notNull(),
    mothersOccupation: p.text("mothers_occupation"),

    guardianName: p.text("guardian_name"),
    guardianRelationship: p.text("guardian_relationship"),
    guardianPhone: p.text("guardian_phone"),
    guardianOccupation: p.text("guardian_occupation"),

    householdIncomeRange: p.text("household_income_range"),
    hasLearningCondition: p.text("has_learning_condition").notNull(),
    learningConditions: p.text("learning_conditions").array(),

    parentConsent: p.boolean("parent_consent").default(false).notNull(),
    declarationConfirmed: p.boolean("declaration_confirmed").default(false).notNull(),
    parentSignatureUrl: p.text("parent_signature_url").notNull(),

    assignedMentor: p.text("assigned_mentor"),
    pretestScore: p.numeric("pretest_score", {
      mode: "number",
    }),

    status: p.text().default("pending").notNull(),

    ...timestamps,
  },
  (table) => [
    index("ash_student_name_idx").on(table.firstName, table.surname),
    index("ash_student_status_idx").on(table.status),
    index("ash_student_school_state_idx").on(table.schoolState),
    index("ash_student_current_class_idx").on(table.currentClass),
    index("ash_student_assigned_mentor_idx").on(table.assignedMentor),
    index("ash_student_created_at_idx").on(table.createdAt),
    index("ash_student_learning_conditions_idx").using(
      "gin",
      table.learningConditions,
    ),
    check("ash_student_age_check", sql`${table.age} >= 6 AND ${table.age} <= 18`),
  ],
);

export const ashTermlyTracking = p.pgTable(
  "ash_termly_tracking",
  {
    id: p.uuid().primaryKey().notNull(),

    studentId: p
      .uuid("student_id")
      .notNull()
      .references(() => ashStudent.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    academicSession: p.text("academic_session").notNull(),
    term: p.text().notNull(),
    schoolName: p.text("school_name").notNull(),

    schoolNumeracyScore: p.numeric("school_numeracy_score", {
      mode: "number",
    }),
    schoolLiteracyScore: p.numeric("school_literacy_score", {
      mode: "number",
    }),
    schoolAverage: p.numeric("school_average", {
      mode: "number",
    }),
    schoolPosition: p.text("school_position"),

    pretestNumeracyScore: p.numeric("pretest_numeracy_score", {
      mode: "number",
    }),
    pretestLiteracyScore: p.numeric("pretest_literacy_score", {
      mode: "number",
    }),
    pretestAverage: p.numeric("pretest_average", {
      mode: "number",
    }),

    midtestNumeracyScore: p.numeric("midtest_numeracy_score", {
      mode: "number",
    }),
    midtestLiteracyScore: p.numeric("midtest_literacy_score", {
      mode: "number",
    }),
    midtestAverage: p.numeric("midtest_average", {
      mode: "number",
    }),

    posttestNumeracyScore: p.numeric("posttest_numeracy_score", {
      mode: "number",
    }),
    posttestLiteracyScore: p.numeric("posttest_literacy_score", {
      mode: "number",
    }),
    posttestAverage: p.numeric("posttest_average", {
      mode: "number",
    }),

    termResultUrl: p.text("term_result_url").notNull(),

    disciplineRating: p.integer("discipline_rating").notNull(),
    responsibilityRating: p.integer("responsibility_rating").notNull(),
    leadershipRating: p.integer("leadership_rating").notNull(),

    notableAchievements: p.text("notable_achievements"),
    challengesObserved: p.text("challenges_observed"),
    nextTermRecommendations: p.text("next_term_recommendations"),
    mentorName: p.text("mentor_name").notNull(),

    ...timestamps,
  },
  (table) => [
    index("ash_termly_tracking_student_idx").on(table.studentId),
    index("ash_termly_tracking_session_term_idx").on(
      table.academicSession,
      table.term,
    ),
    index("ash_termly_tracking_school_idx").on(table.schoolName),
    index("ash_termly_tracking_mentor_idx").on(table.mentorName),
    index("ash_termly_tracking_created_at_idx").on(table.createdAt),
    check(
      "ash_termly_discipline_rating_check",
      sql`${table.disciplineRating} >= 1 AND ${table.disciplineRating} <= 5`,
    ),
    check(
      "ash_termly_responsibility_rating_check",
      sql`${table.responsibilityRating} >= 1 AND ${table.responsibilityRating} <= 5`,
    ),
    check(
      "ash_termly_leadership_rating_check",
      sql`${table.leadershipRating} >= 1 AND ${table.leadershipRating} <= 5`,
    ),
  ],
);

export const ashWeeklyAttendance = p.pgTable(
  "ash_weekly_attendance",
  {
    id: p.uuid().primaryKey().notNull(),

    sessionDate: p.date("session_date").notNull(),
    studentsInAttendance: p.uuid("students_in_attendance").array().notNull(),
    studentsMentored: p.uuid("students_mentored").array().notNull(),
    sessionsConducted: p.text("sessions_conducted").array(),
    sessionDetails: p.text("session_details"),
    volunteersInAttendance: p.text("volunteers_in_attendance").notNull(),
    programReview: p.text("program_review"),

    ...timestamps,
  },
  (table) => [
    index("ash_weekly_attendance_session_date_idx").on(table.sessionDate),
    index("ash_weekly_attendance_created_at_idx").on(table.createdAt),
    index("ash_weekly_students_in_attendance_idx").using(
      "gin",
      table.studentsInAttendance,
    ),
    index("ash_weekly_students_mentored_idx").using("gin", table.studentsMentored),
    index("ash_weekly_sessions_conducted_idx").using(
      "gin",
      table.sessionsConducted,
    ),
  ],
);

export const ashExit = p.pgTable(
  "ash_exit",
  {
    id: p.uuid().primaryKey().notNull(),

    studentId: p
      .uuid("student_id")
      .notNull()
      .references(() => ashStudent.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    ageAtExit: p.integer("age_at_exit").notNull(),
    schoolName: p.text("school_name").notNull(),
    classAtExit: p.text("class_at_exit").notNull(),
    durationInProgram: p.text("duration_in_program").notNull(),
    exitReason: p.text("exit_reason").notNull(),

    academicImpactRating: p.integer("academic_impact_rating").notNull(),
    areasOfImprovement: p.text("areas_of_improvement").array(),
    mentorshipReceived: p.text("mentorship_received").notNull(),
    mentorshipImpactRating: p.integer("mentorship_impact_rating"),

    postAshStatus: p.text("post_ash_status").notNull(),
    institutionName: p.text("institution_name"),
    courseOfStudy: p.text("course_of_study"),
    vocationalSkill: p.text("vocational_skill"),

    enjoyedMost: p.text("enjoyed_most"),
    programImpact: p.text("program_impact"),
    improvementSuggestions: p.text("improvement_suggestions"),

    facilitatorName: p.text("facilitator_name").notNull(),
    exitDate: p.date("exit_date").notNull(),

    ...timestamps,
  },
  (table) => [
    index("ash_exit_student_idx").on(table.studentId),
    index("ash_exit_school_idx").on(table.schoolName),
    index("ash_exit_class_idx").on(table.classAtExit),
    index("ash_exit_reason_idx").on(table.exitReason),
    index("ash_exit_date_idx").on(table.exitDate),
    index("ash_exit_created_at_idx").on(table.createdAt),
    index("ash_exit_areas_of_improvement_idx").using(
      "gin",
      table.areasOfImprovement,
    ),
    check("ash_exit_age_check", sql`${table.ageAtExit} >= 6 AND ${table.ageAtExit} <= 18`),
    check(
      "ash_exit_academic_impact_rating_check",
      sql`${table.academicImpactRating} >= 1 AND ${table.academicImpactRating} <= 10`,
    ),
    check(
      "ash_exit_mentorship_impact_rating_check",
      sql`${table.mentorshipImpactRating} >= 1 AND ${table.mentorshipImpactRating} <= 10`,
    ),
  ],
);

export const capacityBuildingEvaluation = p.pgTable(
  "capacity_building_evaluation",
  {
    id: p.uuid().primaryKey().notNull(),

    programName: p.text("program_name").notNull(),
    programType: p.text("program_type").notNull(),
    programDate: p.date("program_date").notNull(),
    location: p.text().notNull(),
    programCoordinator: p.text("program_coordinator").notNull(),

    numberOfSponsors: p.numeric("number_of_sponsors", {
      mode: "number",
    }).notNull(),
    listOfSponsors: p.text("list_of_sponsors").notNull(),
    sponsorshipType: p.text("sponsorship_type").notNull(),
    partnerOrganizations: p.text("partner_organizations"),
    partnershipLevel: p.text("partnership_level").notNull(),

    numberOfParticipants: p.numeric("number_of_participants", {
      mode: "number",
    }).notNull(),
    targetAudience: p.text("target_audience").notNull(),
    numberOfFacilitators: p.numeric("number_of_facilitators", {
      mode: "number",
    }).notNull(),
    numberOfVolunteers: p.numeric("number_of_volunteers", {
      mode: "number",
    }).notNull(),

    participantEngagementLevel: p.text("participant_engagement_level").notNull(),
    programObjectives: p.text("program_objectives"),
    objectiveAchievement: p.text("objective_achievement").notNull(),
    programOutcome: p.text("program_outcome"),
    programImpact: p.text("program_impact"),
    majorActivities: p.text("major_activities"),
    effectiveActivities: p.text("effective_activities"),

    venueSuitability: p.numeric("venue_suitability", {
      mode: "number",
    }).notNull(),
    timeManagement: p.numeric("time_management", {
      mode: "number",
    }).notNull(),
    resourceAvailability: p.numeric("resource_availability", {
      mode: "number",
    }).notNull(),
    communicationAndCoordination: p.numeric("communication_and_coordination", {
      mode: "number",
    }).notNull(),
    teamworkAmongOrganizers: p.numeric("teamwork_among_organizers", {
      mode: "number",
    }).notNull(),

    challengesEncountered: p.text("challenges_encountered"),
    challengesAddressed: p.text("challenges_addressed"),
    lessonsLearned: p.text("lessons_learned"),

    budgetAllocated: p.text("budget_allocated"),
    budgetUtilized: p.text("budget_utilized"),
    wereResourcesAdequate: p.text("were_resources_adequate"),
    inadequateResourcesExplanation: p.text("inadequate_resources_explanation"),
    overallSuccess: p.text("overall_success"),
    recommendTheProgram: p.text("recommend_the_program"),
    improvementSuggestions: p.text("improvement_suggestions"),
    recommendFuturePrograms: p.text("recommend_future_programs"),

    name: p.text().notNull(),
    role: p.text().notNull(),
    dateSubmitted: p.date("date_submitted").notNull(),

    ...timestamps,
  },
  (table) => [
    index("capacity_program_name_idx").on(table.programName),
    index("capacity_program_type_idx").on(table.programType),
    index("capacity_program_date_idx").on(table.programDate),
    index("capacity_location_idx").on(table.location),
    index("capacity_coordinator_idx").on(table.programCoordinator),
    index("capacity_date_submitted_idx").on(table.dateSubmitted),
    index("capacity_created_at_idx").on(table.createdAt),
    check(
      "capacity_venue_suitability_check",
      sql`${table.venueSuitability} >= 1 AND ${table.venueSuitability} <= 5`,
    ),
    check(
      "capacity_time_management_check",
      sql`${table.timeManagement} >= 1 AND ${table.timeManagement} <= 5`,
    ),
    check(
      "capacity_resource_availability_check",
      sql`${table.resourceAvailability} >= 1 AND ${table.resourceAvailability} <= 5`,
    ),
    check(
      "capacity_communication_coordination_check",
      sql`${table.communicationAndCoordination} >= 1 AND ${table.communicationAndCoordination} <= 5`,
    ),
    check(
      "capacity_teamwork_check",
      sql`${table.teamworkAmongOrganizers} >= 1 AND ${table.teamworkAmongOrganizers} <= 5`,
    ),
  ],
);

export const tacotsFeedback = p.pgTable(
  "tacots_feedback",
  {
    id: p.uuid().primaryKey().notNull(),

    studentFirstName: p.text("student_first_name").notNull(),
    studentSurname: p.text("student_surname").notNull(),
    currentSchool: p.text("current_school").notNull(),
    currentClass: p.text("current_class").notNull(),

    scholarshipHelpedStay: p.text("scholarship_helped_stay").notNull(),
    mostHelpfulSupport: p.text("most_helpful_support").array(),
    studyMotivationRating: p.integer("study_motivation_rating").notNull(),
    mentorshipImpactRating: p.integer("mentorship_impact_rating").notNull(),
    currentChallenges: p.text("current_challenges").array(),
    likedMost: p.text("liked_most"),
    studentImprovementSuggestions: p.text("student_improvement_suggestions"),

    parentGuardianName: p.text("parent_guardian_name").notNull(),
    parentGuardianRelationship: p
      .text("parent_guardian_relationship")
      .notNull(),
    parentPhone: p.text("parent_phone"),

    scholarshipReducedBurden: p.text("scholarship_reduced_burden").notNull(),
    academicImprovementNoticed: p.text("academic_improvement_noticed"),
    attitudeChangeNoticed: p.text("attitude_change_noticed"),
    parentSatisfactionRating: p.integer("parent_satisfaction_rating"),
    programImpactOnFamily: p.text("program_impact_on_family"),
    parentImprovementSuggestions: p.text("parent_improvement_suggestions"),
    additionalComments: p.text("additional_comments"),

    ...timestamps,
  },
  (table) => [
    index("tacots_feedback_student_name_idx").on(
      table.studentFirstName,
      table.studentSurname,
    ),
    index("tacots_feedback_school_idx").on(table.currentSchool),
    index("tacots_feedback_class_idx").on(table.currentClass),
    index("tacots_feedback_parent_phone_idx").on(table.parentPhone),
    index("tacots_feedback_created_at_idx").on(table.createdAt),
    index("tacots_feedback_most_helpful_support_idx").using(
      "gin",
      table.mostHelpfulSupport,
    ),
    index("tacots_feedback_current_challenges_idx").using(
      "gin",
      table.currentChallenges,
    ),
    check(
      "tacots_feedback_study_motivation_check",
      sql`${table.studyMotivationRating} >= 1 AND ${table.studyMotivationRating} <= 5`,
    ),
    check(
      "tacots_feedback_mentorship_impact_check",
      sql`${table.mentorshipImpactRating} >= 1 AND ${table.mentorshipImpactRating} <= 5`,
    ),
    check(
      "tacots_feedback_parent_satisfaction_check",
      sql`${table.parentSatisfactionRating} >= 1 AND ${table.parentSatisfactionRating} <= 5`,
    ),
  ],
);

export const ashProgramFeedback = p.pgTable(
  "ash_program_feedback",
  {
    id: p.uuid().primaryKey().notNull(),

    studentFirstName: p.text("student_first_name").notNull(),
    studentSurname: p.text("student_surname").notNull(),
    schoolName: p.text("school_name").notNull(),
    currentClass: p.text("current_class").notNull(),

    attendanceFrequency: p.text("attendance_frequency").notNull(),
    enjoyedParts: p.text("enjoyed_parts").array(),
    learningImprovementRating: p
      .integer("learning_improvement_rating")
      .notNull(),
    confidenceRating: p.integer("confidence_rating").notNull(),
    volunteerSupportRating: p.integer("volunteer_support_rating").notNull(),

    studentEnjoyedMost: p.text("student_enjoyed_most"),
    studentImprovementSuggestions: p.text("student_improvement_suggestions"),

    parentGuardianName: p.text("parent_guardian_name").notNull(),
    parentGuardianRelationship: p
      .text("parent_guardian_relationship")
      .notNull(),
    parentPhone: p.text("parent_phone"),

    childBenefited: p.text("child_benefited").notNull(),
    academicImprovementNoticed: p.text("academic_improvement_noticed"),
    confidenceBehaviorChange: p.text("confidence_behavior_change"),
    mostValuableAspects: p.text("most_valuable_aspects").array(),
    parentSatisfactionRating: p.integer("parent_satisfaction_rating"),

    programImpactOnChild: p.text("program_impact_on_child"),
    parentImprovementSuggestions: p.text("parent_improvement_suggestions"),
    additionalComments: p.text("additional_comments"),

    ...timestamps,
  },
  (table) => [
    index("ash_feedback_student_name_idx").on(
      table.studentFirstName,
      table.studentSurname,
    ),
    index("ash_feedback_school_idx").on(table.schoolName),
    index("ash_feedback_class_idx").on(table.currentClass),
    index("ash_feedback_parent_phone_idx").on(table.parentPhone),
    index("ash_feedback_created_at_idx").on(table.createdAt),
    index("ash_feedback_enjoyed_parts_idx").using("gin", table.enjoyedParts),
    index("ash_feedback_most_valuable_aspects_idx").using(
      "gin",
      table.mostValuableAspects,
    ),
    check(
      "ash_feedback_learning_improvement_check",
      sql`${table.learningImprovementRating} >= 1 AND ${table.learningImprovementRating} <= 5`,
    ),
    check(
      "ash_feedback_confidence_check",
      sql`${table.confidenceRating} >= 1 AND ${table.confidenceRating} <= 5`,
    ),
    check(
      "ash_feedback_volunteer_support_check",
      sql`${table.volunteerSupportRating} >= 1 AND ${table.volunteerSupportRating} <= 5`,
    ),
    check(
      "ash_feedback_parent_satisfaction_check",
      sql`${table.parentSatisfactionRating} >= 1 AND ${table.parentSatisfactionRating} <= 5`,
    ),
  ],
);

export const volunteerFeedback = p.pgTable(
  "volunteer_feedback",
  {
    id: p.uuid().primaryKey().notNull(),

    firstName: p.text("first_name").notNull(),
    surname: p.text().notNull(),
    programVolunteered: p.text("program_volunteered").notNull(),
    specificProgramDetails: p.text("specific_program_details"),
    volunteerDuration: p.text("volunteer_duration"),

    overallExperienceRating: p.integer("overall_experience_rating").notNull(),
    roleClarityRating: p.integer("role_clarity_rating").notNull(),
    teamSupportRating: p.integer("team_support_rating").notNull(),
    organizationRating: p.integer("organization_rating").notNull(),

    programMadeImpact: p.text("program_made_impact"),
    waysProgramHelped: p.text("ways_program_helped").array(),
    activitiesInvolvedIn: p.text("activities_involved_in").array(),
    skillsDeveloped: p.text("skills_developed"),
    skillsGained: p.text("skills_gained").array(),

    enjoyedMost: p.text("enjoyed_most"),
    challengesExperienced: p.text("challenges_experienced"),
    improvementSuggestions: p.text("improvement_suggestions"),
    continueVolunteering: p.text("continue_volunteering"),
    wouldRecommend: p.text("would_recommend"),
    additionalComments: p.text("additional_comments"),

    submissionDate: p.date("submission_date").notNull(),

    ...timestamps,
  },
  (table) => [
    index("volunteer_feedback_name_idx").on(table.firstName, table.surname),
    index("volunteer_feedback_program_idx").on(table.programVolunteered),
    index("volunteer_feedback_duration_idx").on(table.volunteerDuration),
    index("volunteer_feedback_would_recommend_idx").on(table.wouldRecommend),
    index("volunteer_feedback_submission_date_idx").on(table.submissionDate),
    index("volunteer_feedback_created_at_idx").on(table.createdAt),
    index("volunteer_feedback_ways_helped_idx").using(
      "gin",
      table.waysProgramHelped,
    ),
    index("volunteer_feedback_activities_idx").using(
      "gin",
      table.activitiesInvolvedIn,
    ),
    index("volunteer_feedback_skills_gained_idx").using(
      "gin",
      table.skillsGained,
    ),
    check(
      "volunteer_feedback_overall_experience_check",
      sql`${table.overallExperienceRating} >= 1 AND ${table.overallExperienceRating} <= 5`,
    ),
    check(
      "volunteer_feedback_role_clarity_check",
      sql`${table.roleClarityRating} >= 1 AND ${table.roleClarityRating} <= 5`,
    ),
    check(
      "volunteer_feedback_team_support_check",
      sql`${table.teamSupportRating} >= 1 AND ${table.teamSupportRating} <= 5`,
    ),
    check(
      "volunteer_feedback_organization_check",
      sql`${table.organizationRating} >= 1 AND ${table.organizationRating} <= 5`,
    ),
  ],
);

export const outreachTracker = p.pgTable(
  "outreach_tracker",
  {
    id: p.uuid().primaryKey().notNull(),

    outreachStartDate: p.date("outreach_start_date").notNull(),
    outreachEndDate: p.date("outreach_end_date").notNull(),
    outreachState: p.text("outreach_state").notNull(),
    outreachLga: p.text("outreach_lga").notNull(),
    outreachCity: p.text("outreach_city").notNull(),
    outreachCommunity: p.text("outreach_community").notNull(),

    numVolunteers: p.integer("num_volunteers").notNull(),
    numBeneficiaries: p.integer("num_beneficiaries").notNull(),
    outreachType: p.text("outreach_type").array().notNull(),

    activityDescription: p.text("activity_description").notNull(),
    impactStories: p.text("impact_stories"),
    challengesEncountered: p.text("challenges_encountered"),
    recommendations: p.text(),
    documentationUrl: p.text("documentation_url"),

    submittedBy: p.text("submitted_by").notNull(),
    submissionDate: p.date("submission_date").notNull(),

    ...timestamps,
  },
  (table) => [
    index("outreach_tracker_period_idx").on(
      table.outreachStartDate,
      table.outreachEndDate,
    ),
    index("outreach_tracker_location_idx").on(
      table.outreachState,
      table.outreachLga,
      table.outreachCity,
    ),
    index("outreach_tracker_submitted_by_idx").on(table.submittedBy),
    index("outreach_tracker_submission_date_idx").on(table.submissionDate),
    index("outreach_tracker_created_at_idx").on(table.createdAt),
    index("outreach_tracker_type_idx").using("gin", table.outreachType),
    check(
      "outreach_num_volunteers_check",
      sql`${table.numVolunteers} >= 0`,
    ),
    check(
      "outreach_num_beneficiaries_check",
      sql`${table.numBeneficiaries} >= 0`,
    ),
  ],
);

export const volunteerRegistration = p.pgTable(
  "volunteer_registration",
  {
    id: p.uuid().primaryKey().notNull(),

    firstName: p.text("first_name").notNull(),
    middleName: p.text("middle_name"),
    surname: p.text().notNull(),
    gender: p.text().notNull(),
    dob: p.date().notNull(),
    age: p.integer().notNull(),
    phoneNumber: p.text("phone_number").notNull(),
    emailAddress: p.text("email_address").notNull(),
    homeAddress: p.text("home_address").notNull(),
    city: p.text().notNull(),
    state: p.text().notNull(),

    occupation: p.text(),
    highestEducation: p.text("highest_education"),
    reasonForVolunteering: p.text("reason_for_volunteering").notNull(),

    volunteerAreas: p.text("volunteer_areas").array().notNull(),
    skillsToContribute: p.text("skills_to_contribute").array(),
    availability: p.text().array().notNull(),
    commitmentDuration: p.text("commitment_duration"),

    ashInterest: p.text("ash_interest"),
    ashSaturdayAvailability: p.text("ash_saturday_availability"),
    ashAcademicArea: p.text("ash_academic_area"),
    ashExtracurricular: p.text("ash_extracurricular").array(),

    safeguardingAgreement: p.text("safeguarding_agreement").notNull(),
    mediaConsent: p.boolean("media_consent").default(false).notNull(),
    additionalInfo: p.text("additional_info"),
    registrationDate: p.date("registration_date").notNull(),

    status: p.text().default("pending").notNull(),

    ...timestamps,
  },
  (table) => [
    index("volunteer_registration_name_idx").on(table.firstName, table.surname),
    index("volunteer_registration_email_idx").on(table.emailAddress),
    index("volunteer_registration_phone_idx").on(table.phoneNumber),
    index("volunteer_registration_state_idx").on(table.state),
    index("volunteer_registration_status_idx").on(table.status),
    index("volunteer_registration_date_idx").on(table.registrationDate),
    index("volunteer_registration_created_at_idx").on(table.createdAt),
    index("volunteer_registration_areas_idx").using("gin", table.volunteerAreas),
    index("volunteer_registration_skills_idx").using(
      "gin",
      table.skillsToContribute,
    ),
    index("volunteer_registration_availability_idx").using(
      "gin",
      table.availability,
    ),
    index("volunteer_registration_ash_extracurricular_idx").using(
      "gin",
      table.ashExtracurricular,
    ),
    check("volunteer_registration_age_check", sql`${table.age} >= 16`),
  ],
);

export const tacotsRecommendation = p.pgTable(
  "tacots_recommendation",
  {
    id: p.uuid().primaryKey().notNull(),

    firstName: p.text("first_name").notNull(),
    middleName: p.text("middle_name"),
    surname: p.text().notNull(),
    gender: p.text().notNull(),
    age: p.integer().notNull(),
    dob: p.date().notNull(),

    religion: p.text().notNull(),
    catholicSacraments: p.text("catholic_sacraments").array(),
    parishAttended: p.text("parish_attended"),
    diocese: p.text(),

    primaryLanguage: p.text("primary_language").notNull(),
    phoneNumber: p.text("phone_number"),
    nationality: p.text().notNull(),
    stateOfOrigin: p.text("state_of_origin").notNull(),
    lga: p.text().notNull(),
    homeAddress: p.text("home_address").notNull(),

    schoolName: p.text("school_name").notNull(),
    schoolTown: p.text("school_town").notNull(),
    schoolState: p.text("school_state").notNull(),
    lastYearAttended: p.integer("last_year_attended").notNull(),
    lastClass: p.text("last_class").notNull(),
    classPositionLastTerm: p.text("class_position_last_term").notNull(),
    lastTermAverage: p.numeric("last_term_average", {
      mode: "number",
    }),
    passportPhotoUrl: p.text("passport_photo_url").notNull(),
    lastResultUrl: p.text("last_result_url").notNull(),

    fathersName: p.text("fathers_name").notNull(),
    fathersOccupation: p.text("fathers_occupation").notNull(),
    fathersPhone: p.text("fathers_phone").notNull(),
    mothersName: p.text("mothers_name").notNull(),
    mothersOccupation: p.text("mothers_occupation").notNull(),
    mothersPhone: p.text("mothers_phone").notNull(),
    parentsAddress: p.text("parents_address").notNull(),

    guardianName: p.text("guardian_name"),
    guardianPhone: p.text("guardian_phone"),
    guardianRelationship: p.text("guardian_relationship"),
    guardianOccupation: p.text("guardian_occupation"),
    guardianAddress: p.text("guardian_address"),

    householdSize: p.integer("household_size").notNull(),
    numSiblings: p.integer("num_siblings").notNull(),
    familyPosition: p.text("family_position").notNull(),
    specialCircumstances: p.text("special_circumstances").notNull(),
    annualHouseholdIncome: p.text("annual_household_income").notNull(),
    incomeSources: p.text("income_sources").array().notNull(),
    numIncomeEarners: p.text("num_income_earners").notNull(),
    avgMonthlyIncome: p.numeric("avg_monthly_income", {
      mode: "number",
    }),

    livesWith: p.text("lives_with").notNull(),
    residenceType: p.text("residence_type").notNull(),
    hasElectricity: p.text("has_electricity").notNull(),

    recommenderFirstName: p.text("recommender_first_name").notNull(),
    recommenderLastName: p.text("recommender_last_name").notNull(),
    recommenderPhone: p.text("recommender_phone").notNull(),
    recommenderAddress: p.text("recommender_address").notNull(),

    childBackgroundNotes: p.text("child_background_notes").notNull(),
    supportTypesNeeded: p.text("support_types_needed").array().notNull(),
    otherImportantInfo: p.text("other_important_info"),

    disciplineRating: p.integer("discipline_rating").notNull(),
    responsibilityRating: p.integer("responsibility_rating").notNull(),
    careerGoal: p.text("career_goal").notNull(),
    studentStatement: p.text("student_statement"),
    declarationConfirmed: p.boolean("declaration_confirmed").default(false).notNull(),

    adminStatus: p.text("admin_status").default("KEEP IN VIEW"),

    ...timestamps,
  },
  (table) => [
    index("tacots_recommendation_name_idx").on(table.firstName, table.surname),
    index("tacots_recommendation_gender_idx").on(table.gender),
    index("tacots_recommendation_state_idx").on(table.stateOfOrigin),
    index("tacots_recommendation_lga_idx").on(table.lga),
    index("tacots_recommendation_school_idx").on(table.schoolName),
    index("tacots_recommendation_last_class_idx").on(table.lastClass),
    index("tacots_recommendation_recommender_idx").on(
      table.recommenderFirstName,
      table.recommenderLastName,
    ),
    index("tacots_recommendation_admin_status_idx").on(table.adminStatus),
    index("tacots_recommendation_created_at_idx").on(table.createdAt),
    index("tacots_recommendation_catholic_sacraments_idx").using(
      "gin",
      table.catholicSacraments,
    ),
    index("tacots_recommendation_income_sources_idx").using(
      "gin",
      table.incomeSources,
    ),
    index("tacots_recommendation_support_types_needed_idx").using(
      "gin",
      table.supportTypesNeeded,
    ),
    check("tacots_recommendation_age_check", sql`${table.age} >= 6`),
    check(
      "tacots_recommendation_household_size_check",
      sql`${table.householdSize} >= 2`,
    ),
    check(
      "tacots_recommendation_discipline_rating_check",
      sql`${table.disciplineRating} >= 1 AND ${table.disciplineRating} <= 5`,
    ),
    check(
      "tacots_recommendation_responsibility_rating_check",
      sql`${table.responsibilityRating} >= 1 AND ${table.responsibilityRating} <= 5`,
    ),
  ],
);

export const tacotsOnboarding = p.pgTable(
  "tacots_onboarding",
  {
    id: p.uuid().primaryKey().notNull(),

    studentId: p
      .uuid("student_id")
      .notNull()
      .references(() => tacotsRecommendation.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    onboardingDate: p.date("onboarding_date").notNull(),

    hasMentalHealthDiagnosis: p
      .text("has_mental_health_diagnosis")
      .notNull(),
    diagnosedConditions: p.text("diagnosed_conditions").array(),
    behavioralIndicators: p.text("behavioral_indicators").array().notNull(),
    focusAbilityRating: p.integer("focus_ability_rating").notNull(),
    emotionalStabilityRating: p.integer("emotional_stability_rating").notNull(),
    peerInteractionRating: p.integer("peer_interaction_rating").notNull(),
    receivedCounseling: p.text("received_counseling").notNull(),
    needsSpecialSupport: p.text("needs_special_support").notNull(),
    mentalHealthNotes: p.text("mental_health_notes"),

    generalHealthStatus: p.text("general_health_status").notNull(),
    immunizationStatus: p.text("immunization_status").notNull(),
    hasChronicCondition: p.text("has_chronic_condition").notNull(),
    chronicConditions: p.text("chronic_conditions").array(),
    allergies: p.text().array().notNull(),
    requiresMedication: p.text("requires_medication").notNull(),
    physicalActivityLevel: p.integer("physical_activity_level").notNull(),
    physicalLimitations: p.text("physical_limitations").notNull(),
    additionalHealthNotes: p.text("additional_health_notes"),

    enrolledSchoolName: p.text("enrolled_school_name").notNull(),
    enrolledSchoolTown: p.text("enrolled_school_town").notNull(),
    enrolledSchoolLga: p.text("enrolled_school_lga").notNull(),
    enrolledSchoolState: p.text("enrolled_school_state").notNull(),
    enrolledClass: p.text("enrolled_class").notNull(),
    termResumptionDate: p.date("term_resumption_date").notNull(),
    schoolFeesPerTerm: p.numeric("school_fees_per_term", {
      mode: "number",
    }),

    studentCommitment: p.boolean("student_commitment").default(false),
    parentGuardianCommitment: p
      .boolean("parent_guardian_commitment")
      .default(false)
      .notNull(),
    parentSignatureUrl: p.text("parent_signature_url"),
    admissionLetterUrl: p.text("admission_letter_url"),

    programOfficerNotes: p.text("program_officer_notes"),
    supportTypesApproved: p.text("support_types_approved").array(),
    mentorName: p.text("mentor_name"),
    sponsorName: p.text("sponsor_name"),
    additionalInfo: p.text("additional_info"),

    ...timestamps,
  },
  (table) => [
    index("tacots_onboarding_student_idx").on(table.studentId),
    index("tacots_onboarding_date_idx").on(table.onboardingDate),
    index("tacots_onboarding_school_idx").on(table.enrolledSchoolName),
    index("tacots_onboarding_school_state_idx").on(table.enrolledSchoolState),
    index("tacots_onboarding_class_idx").on(table.enrolledClass),
    index("tacots_onboarding_mentor_idx").on(table.mentorName),
    index("tacots_onboarding_sponsor_idx").on(table.sponsorName),
    index("tacots_onboarding_created_at_idx").on(table.createdAt),
    index("tacots_onboarding_diagnosed_conditions_idx").using(
      "gin",
      table.diagnosedConditions,
    ),
    index("tacots_onboarding_behavioral_indicators_idx").using(
      "gin",
      table.behavioralIndicators,
    ),
    index("tacots_onboarding_chronic_conditions_idx").using(
      "gin",
      table.chronicConditions,
    ),
    index("tacots_onboarding_allergies_idx").using("gin", table.allergies),
    index("tacots_onboarding_support_types_approved_idx").using(
      "gin",
      table.supportTypesApproved,
    ),
    check(
      "tacots_onboarding_focus_ability_check",
      sql`${table.focusAbilityRating} >= 1 AND ${table.focusAbilityRating} <= 5`,
    ),
    check(
      "tacots_onboarding_emotional_stability_check",
      sql`${table.emotionalStabilityRating} >= 1 AND ${table.emotionalStabilityRating} <= 5`,
    ),
    check(
      "tacots_onboarding_peer_interaction_check",
      sql`${table.peerInteractionRating} >= 1 AND ${table.peerInteractionRating} <= 5`,
    ),
    check(
      "tacots_onboarding_physical_activity_check",
      sql`${table.physicalActivityLevel} >= 1 AND ${table.physicalActivityLevel} <= 5`,
    ),
  ],
);

export const tacotsTracking = p.pgTable(
  "tacots_tracking",
  {
    id: p.uuid().primaryKey().notNull(),

    studentId: p
      .uuid("student_id")
      .notNull()
      .references(() => tacotsOnboarding.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    schoolId: p
      .uuid("school_id")
      .notNull()
      .references(() => tacotsOnboarding.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    region: p.text().notNull(),
    academicSession: p.text("academic_session").notNull(),
    academicTerm: p.text("academic_term").notNull(),
    assessmentPeriod: p.text("assessment_period").notNull(),
    submissionDate: p.date("submission_date").notNull(),

    highestSubjectScore: p.text("highest_subject_score").notNull(),
    lowestSubjectScore: p.text("lowest_subject_score").notNull(),
    studentAveragePct: p.numeric("student_average_pct", {
      mode: "number",
    }).notNull(),
    studentPositionInClass: p.text("student_position_in_class").notNull(),
    termResultUrl: p.text("term_result_url").notNull(),
    academicComment: p.text("academic_comment"),

    socialBehaviorRating: p.integer("social_behavior_rating").notNull(),
    schoolRulesRating: p.integer("school_rules_rating").notNull(),
    responsibilityRating: p.integer("responsibility_rating").notNull(),
    formationComments: p.text("formation_comments"),

    mentorName: p.text("mentor_name").notNull(),
    mentorshipSessionDate: p.date("mentorship_session_date").notNull(),
    mentorshipMode: p.text("mentorship_mode").notNull(),
    mentorshipDuration: p.text("mentorship_duration").notNull(),
    mentorshipNotes: p.text("mentorship_notes").notNull(),

    serviceActivityType: p.text("service_activity_type").notNull(),
    serviceDate: p.date("service_date").notNull(),
    serviceDuration: p.text("service_duration").notNull(),
    serviceDescription: p.text("service_description").notNull(),
    serviceSupervisor: p.text("service_supervisor").notNull(),

    tuitionFeePaid: p.numeric("tuition_fee_paid", {
      mode: "number",
    }).notNull(),
    resourcesSpent: p.numeric("resources_spent", {
      mode: "number",
    }).notNull(),
    sundriesSpent: p.numeric("sundries_spent", {
      mode: "number",
    }).notNull(),
    totalAmountSpent: p.numeric("total_amount_spent", {
      mode: "number",
    }).notNull(),
    paymentEvidenceUrl: p.text("payment_evidence_url"),
    financialNotes: p.text("financial_notes"),

    ...timestamps,
  },
  (table) => [
    index("tacots_tracking_student_idx").on(table.studentId),
    index("tacots_tracking_school_idx").on(table.schoolId),
    index("tacots_tracking_region_idx").on(table.region),
    index("tacots_tracking_session_term_idx").on(
      table.academicSession,
      table.academicTerm,
    ),
    index("tacots_tracking_assessment_period_idx").on(table.assessmentPeriod),
    index("tacots_tracking_submission_date_idx").on(table.submissionDate),
    index("tacots_tracking_mentor_idx").on(table.mentorName),
    index("tacots_tracking_mentorship_date_idx").on(
      table.mentorshipSessionDate,
    ),
    index("tacots_tracking_service_date_idx").on(table.serviceDate),
    index("tacots_tracking_created_at_idx").on(table.createdAt),
    check(
      "tacots_tracking_social_behavior_check",
      sql`${table.socialBehaviorRating} >= 1 AND ${table.socialBehaviorRating} <= 5`,
    ),
    check(
      "tacots_tracking_school_rules_check",
      sql`${table.schoolRulesRating} >= 1 AND ${table.schoolRulesRating} <= 5`,
    ),
    check(
      "tacots_tracking_responsibility_check",
      sql`${table.responsibilityRating} >= 1 AND ${table.responsibilityRating} <= 5`,
    ),
  ],
);

export const tacotsExit = p.pgTable(
  "tacots_exit",
  {
    id: p.uuid().primaryKey().notNull(),

    studentId: p
      .uuid("student_id")
      .notNull()
      .references(() => tacotsOnboarding.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    schoolAttendedDuringProgram: p
      .text("school_attended_during_program")
      .notNull(),
    yearOfExit: p.integer("year_of_exit").notNull(),
    exitReason: p.text("exit_reason").notNull(),
    highestEducationAttained: p.text("highest_education_attained").notNull(),
    currentStatus: p.text("current_status").notNull(),

    higherInstitutionName: p.text("higher_institution_name"),
    higherInstitutionCity: p.text("higher_institution_city"),
    higherInstitutionState: p.text("higher_institution_state"),
    employmentType: p.text("employment_type"),
    vocationalSkill: p.text("vocational_skill"),
    newSchoolName: p.text("new_school_name"),
    completedSecondaryElsewhere: p.text("completed_secondary_elsewhere"),

    programImpactDescription: p.text("program_impact_description"),
    programImpactRating: p.integer("program_impact_rating"),
    additionalSituationInfo: p.text("additional_situation_info"),

    completedBy: p.text("completed_by").notNull(),
    submissionDate: p.date("submission_date").notNull(),

    ...timestamps,
  },
  (table) => [
    index("tacots_exit_student_idx").on(table.studentId),
    index("tacots_exit_school_idx").on(table.schoolAttendedDuringProgram),
    index("tacots_exit_year_idx").on(table.yearOfExit),
    index("tacots_exit_reason_idx").on(table.exitReason),
    index("tacots_exit_current_status_idx").on(table.currentStatus),
    index("tacots_exit_completed_by_idx").on(table.completedBy),
    index("tacots_exit_submission_date_idx").on(table.submissionDate),
    index("tacots_exit_created_at_idx").on(table.createdAt),
    check(
      "tacots_exit_program_impact_rating_check",
      sql`${table.programImpactRating} >= 1 AND ${table.programImpactRating} <= 10`,
    ),
  ],
);