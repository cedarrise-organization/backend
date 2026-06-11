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
  imageFileSchema,
  resultFileSchema,
  idSchema,
  baseQueryBody,
  academicSessionSchema,
  rating1To10Schema,
  rating1To5Schema,
  adminStatusSchema,
} from "../../db/globalschema/global.schema.js";

export const tacotsAcademicTermSchema = z.enum(["1ST TERM", "2ND TERM", "3RD TERM"]);

// RECCOMENDATION
export const tacotsRecommendationBody = z.object({
  firstName: textSchema,
  middleName: optionalTextSchema,
  surname: textSchema,
  gender: genderSchema,
  age: z.coerce.number().int().min(6),
  dob: z.coerce.date(),
  religion: z.enum([
    "CHRISTIAN / CATHOLIC",
    "CHRISTIAN / ANGLICAN",
    "CHRISTIAN / OTHER",
    "MUSLIM",
    "OTHER RELIGIONS",
    "NO RELIGION",
  ]),
  catholicSacraments: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(z.enum(["BAPTISM", "FIRST HOLY COMMUNION", "CONFIRMATION", "NONE YET"])).optional(),
  ),
  parishAttended: optionalTextSchema,
  diocese: optionalTextSchema,
  primaryLanguage: z.enum(["ENGLISH", "IGBO", "HAUSA", "YORUBA", "PIDGIN ENGLISH", "OTHER"]),
  phoneNumber: optionalTextSchema,
  nationality: textSchema,
  stateOfOrigin: nigerianStateSchema,
  lga: textSchema,
  homeAddress: textSchema,

  schoolName: textSchema,
  schoolTown: textSchema,
  schoolState: nigerianStateSchema,
  lastYearAttended: z.coerce.number().int(),
  lastClass: classSchema,
  classPositionLastTerm: textSchema,
  lastTermAverage: numericSchema.optional(),

  fathersName: textSchema,
  fathersOccupation: textSchema,
  fathersPhone: textSchema,
  mothersName: textSchema,
  mothersOccupation: textSchema,
  mothersPhone: textSchema,
  parentsAddress: textSchema,

  guardianName: optionalTextSchema,
  guardianPhone: optionalTextSchema,
  guardianRelationship: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .enum(["GRANDPARENT", "AUNT/UNCLE", "SIBLING", "RELATION", "COMMUNITY GUARDIAN", "OTHER"])
      .optional(),
  ),
  guardianOccupation: optionalTextSchema,
  guardianAddress: optionalTextSchema,

  householdSize: z.coerce.number().int().min(2),
  numSiblings: z.coerce.number().int().min(0),
  familyPosition: z.enum([
    "1ST",
    "2ND",
    "3RD",
    "4TH",
    "5TH",
    "6TH",
    "7TH",
    "8TH",
    "9TH",
    "10TH",
    "OTHER",
  ]),
  specialCircumstances: z.enum(["ORPHAN", "SINGLE-PARENT", "LOW FAMILY INCOME", "NONE", "OTHER"]),
  annualHouseholdIncome: z.enum([
    "NO STABLE INCOME",
    "< ₦100,000",
    "₦100,000-₦300,000",
    "₦300,001-₦600,000",
    "₦600,001-₦1,000,000",
    "ABOVE ₦1,000,000",
  ]),
  incomeSources: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(
      z.enum([
        "FARMING",
        "TRADING / SMALL BUSINESS",
        "SALARY / FORMAL EMPLOYMENT",
        "ARTISAN / SKILLED LABOUR",
        "DAILY WAGE WORK",
        "SUPPORT FROM RELATIVE",
        "GOVERNMENT SUPPORT",
        "NO REGULAR INCOME",
        "OTHER",
      ]),
    ),
  ),
  numIncomeEarners: z.enum(["NONE", "1", "2", "3", "MORE THAN 3"]),
  avgMonthlyIncome: numericSchema.optional(),

  livesWith: z.enum([
    "BOTH PARENTS",
    "MOTHER ONLY",
    "FATHER ONLY",
    "GRANDPARENT",
    "OTHER RELATIVE",
    "GUARDIAN",
    "ALONE",
  ]),
  residenceType: z.enum([
    "FAMILY HOUSE",
    "RENTED APARTMENT",
    "SHARED ACCOMMODATION",
    "TEMPORARY SHELTER",
    "OTHER",
  ]),
  hasElectricity: z.enum(["YES", "NO", "SOMETIMES"]),

  recommenderFirstName: textSchema,
  recommenderLastName: textSchema,
  recommenderPhone: textSchema,
  recommenderAddress: textSchema,

  childBackgroundNotes: textSchema,
  supportTypesNeeded: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(z.enum(["TUITION (SCHOOL FEES)", "SCHOOL RESOURCES", "TRANSPORTATION", "OTHER"])),
  ),
  otherImportantInfo: optionalTextSchema,

  disciplineRating: rating1To5Schema,
  responsibilityRating: rating1To5Schema,
  careerGoal: textSchema,
  studentStatement: optionalTextSchema,
  declarationConfirmed: z.coerce.boolean().default(false),
});

export type TacotsrecommendationbodyType = z.infer<typeof tacotsRecommendationBody>;

export const createTacotsRecommendationSchema = z.object({
  body: tacotsRecommendationBody,
  files: z.object({
    passportPhoto: imageFileSchema,
    lastResult: resultFileSchema,
  }),
});

export const updateTacotsRecommendationSchema = z.object({
  body: tacotsRecommendationBody.partial(),
  files: z
    .object({
      passportPhoto: imageFileSchema.optional(),
      lastResult: resultFileSchema.optional(),
    })
    .optional(),
});

export const updateTacotsRecommendationStatusSchema = z.object({
  query: z.object({
    status: adminStatusSchema,
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});
export const tacotsRecommendationParamsSchema = idSchema;

export const tacotsRecommendationQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    status: adminStatusSchema,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum(["firstName", "surname", "gender", "schoolName", "lastClass", "createdAt"])
        .default("createdAt"),
    ),
  }),
});

// FEEDBACK
export const tacotsFeedbackBody = z.object({
  studentFirstName: textSchema,
  studentSurname: textSchema,
  currentSchool: textSchema,
  currentClass: z.enum([
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
  scholarshipHelpedStay: z.enum(["YES - VERY MUCH", "YES - SOMEWHAT", "NOT SURE", "NO"]),
  mostHelpfulSupport: z.preprocess(
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
          "TUITION SUPPORT",
          "BOOKS AND LEARNING MATERIALS",
          "SCHOOL SUPPLIES",
          "MENTORSHIP",
          "ENCOURAGEMENT AND GUIDANCE",
        ]),
      )
      .optional(),
  ),
  studyMotivationRating: rating1To5Schema,
  mentorshipImpactRating: rating1To5Schema,
  currentChallenges: z.preprocess(
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
          "DIFFICULTY UNDERSTANDING SUBJECTS",
          "FINANCIAL CHALLENGES",
          "LACK OF MATERIALS",
          "TRANSPORTATION",
          "FAMILY RESPONSIBILITIES",
          "OTHER",
        ]),
      )
      .optional(),
  ),
  likedMost: optionalTextSchema,
  studentImprovementSuggestions: optionalTextSchema,

  parentGuardianName: textSchema,
  parentGuardianRelationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE"]),
  parentPhone: optionalTextSchema,
  scholarshipReducedBurden: z.enum([
    "YES - SIGNIFICANTLY",
    "YES - SOMEWHAT",
    "NOT REALLY",
    "NOT SURE",
  ]),
  academicImprovementNoticed: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["YES - SIGNIFICANT", "YES - SOME", "NO NOTICEABLE CHANGE", "NOT SURE"]).optional(),
  ),
  attitudeChangeNoticed: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["YES - VERY POSITIVE", "SOME IMPROVEMENT", "NO CHANGE", "NOT SURE"]).optional(),
  ),
  parentSatisfactionRating: rating1To5Schema.optional(),
  programImpactOnFamily: optionalTextSchema,
  parentImprovementSuggestions: optionalTextSchema,
  additionalComments: optionalTextSchema,
});

export type TacotsfeedbackbodyType = z.infer<typeof tacotsFeedbackBody>;

export const createTacotsFeedbackSchema = z.object({
  body: tacotsFeedbackBody,
});

export const updateTacotsFeedbackSchema = z.object({
  body: tacotsFeedbackBody.partial(),
});

export const tacotsFeedbackParamsSchema = idSchema;

export const tacotsFeedbackQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});

// ONBOARDING
export const tacotsOnboardingBody = z.object({
  studentId: z.uuid("Invalid ID"),
  onboardingDate: z.coerce.date(),

  hasMentalHealthDiagnosis: z.enum(["YES", "NO", "NOT SURE"]),
  diagnosedConditions: z.preprocess(
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
          "ADHD",
          "AUTISM SPECTRUM",
          "LEARNING DIFFICULTY",
          "INTELLECTUAL DISABILITY",
          "EMOTIONAL / BEHAVIORAL DISORDER",
          "SPEECH OR LANGUAGE DELAY",
          "ANXIETY OR DEPRESSION",
          "NONE DIAGNOSED",
          "OTHER",
        ]),
      )
      .optional(),
  ),
  behavioralIndicators: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(
      z.enum([
        "DIFFICULTY CONCENTRATING",
        "EASILY DISTRACTED",
        "RESTLESS / HYPERACTIVE",
        "DIFFICULTY UNDERSTANDING LESSONS",
        "DIFFICULTY READING OR WRITING",
        "DIFFICULTY FOLLOWING INSTRUCTIONS",
        "FREQUENT EMOTIONAL OUTBURSTS",
        "SOCIAL WITHDRAWAL",
        "AGGRESSIVE BEHAVIOR",
        "NONE OF THE ABOVE",
        "OTHER",
      ]),
    ),
  ),
  focusAbilityRating: rating1To5Schema,
  emotionalStabilityRating: rating1To5Schema,
  peerInteractionRating: rating1To5Schema,
  receivedCounseling: z.enum(["YES", "NO", "NOT SURE"]),
  needsSpecialSupport: z.enum(["YES", "NO", "POSSIBLY / NEEDS ASSESSMENT"]),
  mentalHealthNotes: optionalTextSchema,

  generalHealthStatus: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  immunizationStatus: z.enum([
    "FULLY IMMUNIZED",
    "PARTIALLY IMMUNIZED",
    "NOT IMMUNIZED",
    "STATUS UNKNOWN",
  ]),
  hasChronicCondition: z.enum(["NO", "YES", "NOT SURE"]),
  chronicConditions: z.preprocess(
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
          "ASTHMA",
          "DIABETES",
          "EPILEPSY",
          "SICKLE CELL DISEASE",
          "HEART CONDITION",
          "PHYSICAL DISABILITY",
          "VISION IMPAIRMENT",
          "HEARING IMPAIRMENT",
          "OTHER",
        ]),
      )
      .optional(),
  ),
  allergies: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(
      z.enum([
        "NO KNOWN ALLERGIES",
        "FOOD ALLERGIES",
        "DRUG ALLERGIES",
        "ENVIRONMENTAL ALLERGIES",
        "OTHER",
      ]),
    ),
  ),
  requiresMedication: yesNoSchema,
  physicalActivityLevel: rating1To5Schema,
  physicalLimitations: z.enum([
    "NONE",
    "DIFFICULTY WALKING OR RUNNING",
    "DIFFICULTY SEEING",
    "DIFFICULTY HEARING",
    "OTHER",
  ]),
  additionalHealthNotes: optionalTextSchema,

  enrolledSchoolName: textSchema,
  enrolledSchoolTown: textSchema,
  enrolledSchoolLga: textSchema,
  enrolledSchoolState: nigerianStateSchema,
  enrolledClass: classSchema,
  termResumptionDate: z.coerce.date(),
  schoolFeesPerTerm: numericSchema.optional(),

  studentCommitment: z.coerce.boolean().default(false).optional(),
  parentGuardianCommitment: z.coerce.boolean().default(false),
  programOfficerNotes: optionalTextSchema,
  supportTypesApproved: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z
      .array(z.enum(["TUITION (SCHOOL FEES)", "SCHOOL RESOURCES", "TRANSPORTATION", "OTHER"]))
      .optional(),
  ),
  mentorName: optionalTextSchema,
  sponsorName: optionalTextSchema,
  additionalInfo: optionalTextSchema,
});

export type TacotsonboardingbodyType = z.infer<typeof tacotsOnboardingBody>;

export const createTacotsOnboardingSchema = z.object({
  body: tacotsOnboardingBody,
  files: z
    .object({
      parentSignature: imageFileSchema.optional(),
      admissionLetter: resultFileSchema.optional(),
    })
    .optional(),
});

export const updateTacotsOnboardingSchema = z.object({
  body: tacotsOnboardingBody.partial(),
  files: z
    .object({
      parentSignature: imageFileSchema.optional(),
      admissionLetter: resultFileSchema.optional(),
    })
    .optional(),
});

export const tacotsOnboardingParamsSchema = idSchema;

export const tacotsOnboardingQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum([
          "onboardingDate",
          "generalHealthStatus",
          "enrolledSchoolName",
          "enrolledSchoolState",
          "enrolledClass",
          "createdAt",
        ])
        .default("createdAt"),
    ),
  }),
});

// TRACKING
export const tacotsTrackingBody = z.object({
  studentId: z.uuid("Invalid ID"),
  schoolId: z.uuid("Invalid ID"),
  region: nigerianStateSchema,
  academicSession: academicSessionSchema,
  academicTerm: tacotsAcademicTermSchema,
  assessmentPeriod: z.enum(["MIDTERM", "END OF TERM"]),
  submissionDate: z.coerce.date(),

  highestSubjectScore: textSchema,
  lowestSubjectScore: textSchema,
  studentAveragePct: numericSchema,
  studentPositionInClass: textSchema,
  academicComment: optionalTextSchema,

  socialBehaviorRating: rating1To5Schema,
  schoolRulesRating: rating1To5Schema,
  responsibilityRating: rating1To5Schema,
  formationComments: optionalTextSchema,

  mentorName: textSchema,
  mentorshipSessionDate: z.coerce.date(),
  mentorshipMode: z.enum(["PHYSICAL (IN-PERSON)", "VIRTUAL (ONLINE)"]),
  mentorshipDuration: z.enum([
    "15 MINUTES",
    "30 MINUTES",
    "45 MINUTES",
    "60 MINUTES",
    "MORE THAN 60 MINUTES",
  ]),
  mentorshipNotes: textSchema,

  serviceActivityType: z.enum([
    "ENVIRONMENTAL SANITATION",
    "TEACHING YOUNGER CHILDREN",
    "CHURCH / COMMUNITY SUPPORT",
    "HELPING ELDERLY PERSONS",
    "SCHOOL VOLUNTEERING",
    "OTHER",
  ]),
  serviceDate: z.coerce.date(),
  serviceDuration: z.enum([
    "30 MINS",
    "1 HOUR",
    "2 HOURS",
    "3 HOURS",
    "4 HOURS",
    "5 HOURS",
    "MORE THAN 5 HOURS",
  ]),
  serviceDescription: textSchema,
  serviceSupervisor: textSchema,

  tuitionFeePaid: numericSchema,
  resourcesSpent: numericSchema,
  sundriesSpent: numericSchema,
  totalAmountSpent: numericSchema,
  financialNotes: optionalTextSchema,
});

export type TacotstrackingbodyType = z.infer<typeof tacotsTrackingBody>;

export const createTacotsTrackingSchema = z.object({
  body: tacotsTrackingBody,
  files: z.object({
    termResult: resultFileSchema,
    paymentEvidence: resultFileSchema.optional(),
  }),
});

export const updateTacotsTrackingSchema = z.object({
  body: tacotsTrackingBody.partial(),
  files: z
    .object({
      termResult: resultFileSchema.optional(),
      paymentEvidence: resultFileSchema.optional(),
    })
    .optional(),
});

export const tacotsTrackingParamsSchema = idSchema;

export const tacotsTrackingQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum([
          "academicSession",
          "academicTerm",
          "assessmentPeriod",
          "createdAt",
        ])
        .default("createdAt"),
    ),
  }),
});

// EXIT
export const tacotsExitBody = z.object({
  studentId: z.uuid("Invalid ID"),
  schoolAttendedDuringProgram: textSchema,
  yearOfExit: z.coerce.number().int(),
  exitReason: z.enum([
    "COMPLETED SECONDARY EDUCATION (GRADUATED)",
    "DID NOT MEET PROGRAM REQUIREMENTS",
    "DROPPED OUT OF SCHOOL",
    "WITHDREW FROM THE PROGRAM",
    "RELOCATED / MOVED AWAY",
    "PERSONAL OR FAMILY REASONS",
    "OTHER",
  ]),
  highestEducationAttained: z.enum(["PRIMARY", "JUNIOR SECONDARY", "SENIOR SECONDARY"]),
  currentStatus: z.enum([
    "CONTINUING SECONDARY EDUCATION ELSEWHERE",
    "ADMITTED INTO HIGHER INSTITUTION",
    "LEARNING A TRADE / VOCATIONAL SKILL",
    "EMPLOYED",
    "NOT CURRENTLY STUDYING OR WORKING",
    "OTHER",
  ]),
  higherInstitutionName: optionalTextSchema,
  higherInstitutionCity: optionalTextSchema,
  higherInstitutionState: optionalTextSchema,
  employmentType: optionalTextSchema,
  vocationalSkill: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .enum([
        "TAILORING / FASHION DESIGN",
        "HAIRDRESSING / BARBING",
        "CARPENTRY",
        "ELECTRICAL WORK",
        "ICT / COMPUTER TRAINING",
        "CATERING",
        "AUTO MECHANIC",
        "OTHER",
      ])
      .optional(),
  ),
  newSchoolName: optionalTextSchema,
  completedSecondaryElsewhere: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["YES", "NO", "CURRENTLY STUDYING", "NOT SURE"]).optional(),
  ),
  programImpactDescription: optionalTextSchema,
  programImpactRating: rating1To10Schema.optional(),
  additionalSituationInfo: optionalTextSchema,
  completedBy: textSchema,
  submissionDate: z.coerce.date(),
});

export type TacotsexitbodyType = z.infer<typeof tacotsExitBody>;

export const createTacotsExitSchema = z.object({
  body: tacotsExitBody,
});

export const updateTacotsExitSchema = z.object({
  body: tacotsExitBody.partial(),
});

export const tacotsExitParamsSchema = idSchema;

export const tacotsExitQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum(["schoolAttendedDuringProgram", "yearOfExit", "exitReason", "createdAt"])
        .default("createdAt"),
    ),
  }),
});
