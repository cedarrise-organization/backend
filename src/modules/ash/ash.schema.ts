//MODELS
import * as z from "zod";
import {
  textSchema,
  optionalTextSchema,
  genderSchema,
  nigerianStateSchema,
  classSchema,
  yesNoSchema,
  numericSchema,
  statusSchema,
  imageFileSchema,
  resultFileSchema,
  idSchema,
  baseQueryBody,
  academicSessionSchema,
  rating1To10Schema,
  rating1To5Schema,
  singleResultFileSchema,
} from "../../db/globalschema/global.schema.js";

export const ashTermSchema = z.enum(["TERM 1", "TERM 2", "TERM 3"]);

// ASH STUDENT
export const ashStudentBody = z.object({
  programType: z.enum(["ONLINE", "OFFLINE"]),
  firstName: textSchema,
  middleName: optionalTextSchema,
  surname: textSchema,
  gender: genderSchema,
  age: z.coerce.number().int().min(6).max(18),
  dob: z.coerce.date(),
  primaryLanguage: z.enum(["ENGLISH", "IGBO", "HAUSA", "YORUBA", "PIDGIN ENGLISH", "OTHER"]),

  homeAddress: textSchema,
  studentPhone: optionalTextSchema,

  schoolName: textSchema,
  schoolTown: textSchema,
  schoolLga: textSchema,
  schoolState: nigerianStateSchema,
  currentClass: classSchema,
  classPositionLastTerm: textSchema,

  prevAfterschoolProgram: yesNoSchema,
  reasonForJoining: textSchema,

  fathersName: textSchema,
  fathersPhone: optionalTextSchema,
  fathersOccupation: textSchema,
  mothersName: textSchema,
  mothersPhone: textSchema,
  mothersOccupation: optionalTextSchema,

  guardianName: optionalTextSchema,
  guardianRelationship: z.preprocess(
    (v) => (v === "" || v === "undefined" ? undefined : v),
    z
      .enum([
        "BROTHER",
        "SISTER",
        "AUNTY",
        "UNCLE",
        "GRANDMOTHER",
        "GRANDFATHER",
        "COUSIN",
        "OTHER",
      ])
      .optional(),
  ),
  guardianPhone: optionalTextSchema,
  guardianOccupation: optionalTextSchema,

  householdIncomeRange: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["NO STABLE INCOME", "< ₦100K", "₦100K-₦300K", "₦300K-₦600K", "₦600K-₦1M"]).optional(),
  ),
  hasLearningCondition: z.enum(["NO", "YES", "NOT SURE"]),
  learningConditions: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z
      .array(
        z.enum([
          "LEARNING DIFFICULTY",
          "VISION IMPAIRMENT",
          "HEARING IMPAIRMENT",
          "ATTENTION DIFFICULTY",
          "PHYSICAL DISABILITY",
          "OTHER",
        ]),
      )
      .optional(),
  ),

  parentConsent: z.coerce.boolean().default(false),
  declarationConfirmed: z.coerce.boolean().default(false),

  assignedMentor: optionalTextSchema,
  pretestScore: numericSchema.optional(),
});

export type AshstudentbodyType = z.infer<typeof ashStudentBody>;

export const createAshStudentSchema = z.object({
  body: ashStudentBody,
  files: z.object({
    passportPhoto: imageFileSchema,
    lastResult: resultFileSchema.optional(),
    parentSignature: imageFileSchema,
  }),
});

export const updateAshStudentSchema = z.object({
  body: ashStudentBody.partial(),
  files: z
    .object({
      passportPhoto: imageFileSchema.optional(),
      lastResult: resultFileSchema.optional(),
      parentSignature: imageFileSchema.optional(),
    })
    .optional(),
});

export const ashStudentParamsSchema = idSchema;

export const ashStudentQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    status: statusSchema,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum([
          "firstName",
          "surname",
          "createdAt",
          "schoolState",
          "assignedMentor",
          "currentClass",
          "gender",
        ])
        .default("createdAt"),
    ),
  }),
});

export const updateAshStudentStatusSchema = z.object({
  query: z.object({
    status: statusSchema,
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const updateAshStudentMentorSchema = z.object({
  body: z.object({
    mentor: z.string("Must include a mentor's name").min(3),
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});
//

// ASH FEEDBACK
export const ashProgramFeedbackBody = z.object({
  studentFirstName: textSchema,
  studentSurname: textSchema,
  schoolName: textSchema,
  currentClass: z.enum([
    "PRIMARY 3",
    "PRIMARY 4",
    "PRIMARY 5",
    "PRIMARY 6",
    "JSS1",
    "JSS2",
    "JSS3",
    "SS1",
    "SS2",
    "SS3",
  ]),
  attendanceFrequency: z.enum(["EVERY WEEK", "MOST WEEKS", "SOMETIMES", "RARELY"]),
  enjoyedParts: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z
      .array(
        z.enum([
          "ACADEMIC TUTORING",
          "LITERACY",
          "NUMERACY",
          "PERFORMANCE ARTS",
          "SKILLS TRAINING",
          "MENTORSHIP",
          "GROUP ACTIVITIES",
        ]),
      )
      .optional(),
  ),
  learningImprovementRating: rating1To5Schema,
  confidenceRating: rating1To5Schema,
  volunteerSupportRating: rating1To5Schema,
  studentEnjoyedMost: optionalTextSchema,
  studentImprovementSuggestions: optionalTextSchema,

  parentGuardianName: textSchema,
  parentGuardianRelationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE"]),
  parentPhone: optionalTextSchema,
  childBenefited: z.enum(["YES - GREATLY", "YES - SOMEWHAT", "NOT SURE", "NO"]),
  academicImprovementNoticed: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["YES - SIGNIFICANT", "YES - SOME", "NO NOTICEABLE CHANGE", "NOT SURE"]).optional(),
  ),
  confidenceBehaviorChange: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["YES - VERY POSITIVE", "SOME IMPROVEMENT", "NO CHANGE", "NOT SURE"]).optional(),
  ),
  mostValuableAspects: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z
      .array(
        z.enum([
          "ACADEMIC TUTORING",
          "LITERACY & NUMERACY",
          "MENTORSHIP",
          "SKILLS TRAINING",
          "PERFORMANCE ARTS",
          "POSITIVE ENVIRONMENT",
        ]),
      )
      .optional(),
  ),
  parentSatisfactionRating: rating1To5Schema.optional(),
  programImpactOnChild: optionalTextSchema,
  parentImprovementSuggestions: optionalTextSchema,
  additionalComments: optionalTextSchema,
});

export type AshprogramfeedbackType = z.infer<typeof ashProgramFeedbackBody>;

export const createAshProgramFeedbackSchema = z.object({
  body: ashProgramFeedbackBody,
});

export const updateAshProgramFeedbackSchema = z.object({
  body: ashProgramFeedbackBody.partial(),
});

export const ashProgramFeedbackParamsSchema = idSchema;

export const ashProgramFeedbackQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});
//

// ASH TERMLY TRACKING
export const ashTermlyTrackingBody = z.object({
  studentId: z.uuid("Invalid ID"),
  academicSession: academicSessionSchema,
  term: ashTermSchema,
  schoolName: textSchema,

  schoolNumeracyScore: numericSchema.optional(),
  schoolLiteracyScore: numericSchema.optional(),
  schoolAverage: numericSchema.optional(),
  schoolPosition: optionalTextSchema,

  pretestNumeracyScore: numericSchema.optional(),
  pretestLiteracyScore: numericSchema.optional(),
  pretestAverage: numericSchema.optional(),

  midtestNumeracyScore: numericSchema.optional(),
  midtestLiteracyScore: numericSchema.optional(),
  midtestAverage: numericSchema.optional(),

  posttestNumeracyScore: numericSchema.optional(),
  posttestLiteracyScore: numericSchema.optional(),
  posttestAverage: numericSchema.optional(),

  disciplineRating: rating1To5Schema,
  responsibilityRating: rating1To5Schema,
  leadershipRating: rating1To5Schema,

  notableAchievements: optionalTextSchema,
  challengesObserved: optionalTextSchema,
  nextTermRecommendations: optionalTextSchema,
  mentorName: textSchema,
});

export type AshtermlytrackingbodyType = z.infer<typeof ashTermlyTrackingBody>;

export const createAshTermlyTrackingSchema = z.object({
  body: ashTermlyTrackingBody,
  file: singleResultFileSchema,
});

export const updateAshTermlyTrackingSchema = z.object({
  body: ashTermlyTrackingBody.partial(),
  file: resultFileSchema.optional(),
});

export const ashTermlyTrackingParamsSchema = idSchema;

export const ashTermlyTrackingQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum(["academicSession", "term", "schoolName", "mentorName", "createdAt"])
        .default("createdAt"),
    ),
  }),
});
//

// ASH WEEKLY ATTENDANCE
export const ashWeeklyAttendanceBody = z.object({
  sessionDate: z.coerce.date(),
  studentsInAttendance: z.array(z.uuid("Invalid ID")).min(1),
  studentsMentored: z.array(z.uuid("Invalid ID")).min(1),
  sessionsConducted: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(z.enum(["PERFORMANCE ART", "SKILLS TRAINING", "FORMATIVE TALKS"])).optional(),
  ),
  sessionDetails: optionalTextSchema,
  volunteersInAttendance: textSchema,
  programReview: optionalTextSchema,
});

export type AshweeklyattendancebodyType = z.infer<typeof ashWeeklyAttendanceBody>;

export const createAshWeeklyAttendanceSchema = z.object({
  body: ashWeeklyAttendanceBody,
});

export const updateAshWeeklyAttendanceSchema = z.object({
  body: ashWeeklyAttendanceBody.partial(),
});

export const ashWeeklyAttendanceParamsSchema = idSchema;

export const ashWeeklyAttendanceQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});
//

// ASH EXIT
export const ashExitBody = z.object({
  studentId: z.uuid("Invalid ID"),
  ageAtExit: z.coerce.number().int().min(6).max(18),
  schoolName: textSchema,
  classAtExit: classSchema,
  durationInProgram: z.enum([
    "LESS THAN 6 MONTHS",
    "6 MONTHS-1 YEAR",
    "1 YEAR",
    "2 YEARS",
    "3 YEARS",
    "4 YEARS",
    "5 YEARS",
    "6 YEARS",
    "7 YEARS",
    "8 YEARS",
    "9 YEARS",
    "10 YEARS",
    "11 YEARS",
    "12 YEARS",
  ]),
  exitReason: z.enum([
    "COMPLETED",
    "GRADUATED",
    "MOVED",
    "PERSONAL / FAMILY",
    "COULD NOT ATTEND",
    "DROPPED OUT",
    "OTHER",
  ]),
  academicImpactRating: rating1To10Schema,
  areasOfImprovement: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z
      .array(
        z.enum([
          "LITERACY",
          "NUMERACY",
          "VOCATIONAL",
          "DIGITAL LITERACY",
          "SOFT SKILLS",
          "CHARACTER",
          "OTHER",
        ]),
      )
      .optional(),
  ),
  mentorshipReceived: z.enum(["REGULARLY", "OFTEN", "OCCASIONALLY", "RARELY", "NEVER"]),
  mentorshipImpactRating: rating1To10Schema.optional(),
  postAshStatus: z.enum([
    "CONTINUING SCHOOL",
    "COMPLETED SCHOOL",
    "UNIVERSITY",
    "VOCATIONAL",
    "EMPLOYED",
    "NOT IN TRAINING",
  ]),
  institutionName: optionalTextSchema,
  courseOfStudy: optionalTextSchema,
  vocationalSkill: optionalTextSchema,
  enjoyedMost: optionalTextSchema,
  programImpact: optionalTextSchema,
  improvementSuggestions: optionalTextSchema,
  facilitatorName: textSchema,
  exitDate: z.coerce.date(),
});

export type AshexitbodyType = z.infer<typeof ashExitBody>;

export const createAshExitSchema = z.object({
  body: ashExitBody,
});

export const updateAshExitSchema = z.object({
  body: ashExitBody.partial(),
});

export const ashExitParamsSchema = idSchema;

export const ashExitQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum([
          "ageAtExit",
          "schoolName",
          "classAtExit",
          "durationInProgram",
          "facilitatorName",
          "exitDate",
          "createdAt",
        ])
        .default("createdAt"),
    ),
  }),
});
//
