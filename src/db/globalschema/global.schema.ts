import * as z from "zod";

// CONSTS
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const baseQueryBody = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
};

// UTILS
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const uploadedFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "file must not be more than 20mb"),
  buffer: z.instanceof(Buffer),
});

export const uploadedFileObjectSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "file must not be more than 20mb"),
  buffer: z.instanceof(Buffer),
});

export const imageFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      "Uploaded file should be jpeg, jpg, png, or webp",
    ),
  }),
);

export const documentFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      "Uploaded file should be a pdf, doc, or docx",
    ),
  }),
);

export const resultFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
      "Uploaded file should be an image or pdf",
    ),
  }),
);
export const textSchema = z.string().transform((v) => v.trim());
export const optionalTextSchema = textSchema.optional();

export const emailSchema = z.email().transform((v) => v.toLowerCase().trim());

export const genderSchema = z.enum(["MALE", "FEMALE"]);

export const yesNoSchema = z.enum(["YES", "NO"]);

export const statusSchema = z.enum(["accepted", "rejected", "pending"]);

export const adminStatusSchema = z.enum(["NOT SELECTED", "KEEP IN VIEW", "SELECTED"]);

export const academicSessionSchema = z.enum([
  "2024/25",
  "2025/26",
  "2026/27",
  "2027/28",
  "2028/29",
  "2029/30",
]);

export const tacotsAcademicTermSchema = z.enum(["1ST TERM", "2ND TERM", "3RD TERM"]);

export const nigerianStateSchema = z.enum([
  "ABIA",
  "ADAMAWA",
  "AKWA IBOM",
  "ANAMBRA",
  "BAUCHI",
  "BAYELSA",
  "BENUE",
  "BORNO",
  "CROSS RIVER",
  "DELTA",
  "EBONYI",
  "EDO",
  "EKITI",
  "ENUGU",
  "GOMBE",
  "IMO",
  "JIGAWA",
  "KADUNA",
  "KANO",
  "KATSINA",
  "KEBBI",
  "KOGI",
  "KWARA",
  "LAGOS",
  "NASARAWA",
  "NIGER",
  "OGUN",
  "ONDO",
  "OSUN",
  "OYO",
  "PLATEAU",
  "RIVERS",
  "SOKOTO",
  "TARABA",
  "YOBE",
  "ZAMFARA",
  "FCT",
  "OTHER",
]);

export const classSchema = z.enum([
  "PRIMARY 1",
  "PRIMARY 2",
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
]);

export const rating1To5Schema = z.coerce.number().int().min(1).max(5);

export const rating1To10Schema = z.coerce.number().int().min(1).max(10);

export const numericSchema = z.coerce.number();

////////////////
export const capacityBuildingEvaluationBody = z.object({
  programName: textSchema,
  programType: z.enum([
    "Professional Program",
    "Undergraduates Program",
    "Secondary School Program",
    "other",
  ]),
  programDate: z.coerce.date(),
  location: textSchema,
  programCoordinator: textSchema,

  numberOfSponsors: numericSchema,
  listOfSponsors: textSchema,
  sponsorshipType: z.enum([
    "Financial",
    "Materials/Equipment",
    "Venue Support",
    "Technical Expertise",
    "Other",
  ]),
  partnerOrganizations: optionalTextSchema,
  partnershipLevel: z.enum([
    "Planning",
    "Funding",
    "Implementation",
    "Monitoring & Evaluation",
    "other",
  ]),

  numberOfParticipants: numericSchema,
  targetAudience: textSchema,
  numberOfFacilitators: numericSchema,
  numberOfVolunteers: numericSchema,

  participantEngagementLevel: z.enum(["low", "moderate", "high"]),
  programObjectives: optionalTextSchema,
  objectiveAchievement: z.enum(["Fully achieved", "Partially achieved", "Not achieved"]),
  programOutcome: optionalTextSchema,
  programImpact: optionalTextSchema,
  majorActivities: optionalTextSchema,
  effectiveActivities: optionalTextSchema,

  venueSuitability: z.coerce.number().min(1).max(5),
  timeManagement: z.coerce.number().min(1).max(5),
  resourceAvailability: z.coerce.number().min(1).max(5),
  communicationAndCoordination: z.coerce.number().min(1).max(5),
  teamworkAmongOrganizers: z.coerce.number().min(1).max(5),

  challengesEncountered: optionalTextSchema,
  challengesAddressed: optionalTextSchema,
  lessonsLearned: optionalTextSchema,

  budgetAllocated: optionalTextSchema,
  budgetUtilized: optionalTextSchema,
  wereResourcesAdequate: z.enum(["yes", "no"]).optional(),
  inadequateResourcesExplanation: optionalTextSchema,
  overallSuccess: z.enum(["Poor", "Fair", "Good", "Very Good", "Excellent"]).optional(),
  recommendTheProgram: z.enum(["yes", "no"]).optional(),
  improvementSuggestions: optionalTextSchema,
  recommendFuturePrograms: optionalTextSchema,

  name: textSchema,
  role: textSchema,
  dateSubmitted: z.coerce.date(),
});

export const createCapacityBuildingEvaluationSchema = z.object({
  body: capacityBuildingEvaluationBody,
});

export const updateCapacityBuildingEvaluationSchema = z.object({
  body: capacityBuildingEvaluationBody.partial(),
});

export const capacityBuildingEvaluationParamsSchema = idSchema;

export const capacityBuildingEvaluationQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});

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
  scholarshipHelpedStay: z.enum(["YES – VERY MUCH", "YES – SOMEWHAT", "NOT SURE", "NO"]),
  mostHelpfulSupport: z
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
  studyMotivationRating: rating1To5Schema,
  mentorshipImpactRating: rating1To5Schema,
  currentChallenges: z
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
  likedMost: optionalTextSchema,
  studentImprovementSuggestions: optionalTextSchema,

  parentGuardianName: textSchema,
  parentGuardianRelationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE"]),
  parentPhone: optionalTextSchema,
  scholarshipReducedBurden: z.enum([
    "YES – SIGNIFICANTLY",
    "YES – SOMEWHAT",
    "NOT REALLY",
    "NOT SURE",
  ]),
  academicImprovementNoticed: z
    .enum(["YES – SIGNIFICANT", "YES – SOME", "NO NOTICEABLE CHANGE", "NOT SURE"])
    .optional(),
  attitudeChangeNoticed: z
    .enum(["YES – VERY POSITIVE", "SOME IMPROVEMENT", "NO CHANGE", "NOT SURE"])
    .optional(),
  parentSatisfactionRating: rating1To5Schema.optional(),
  programImpactOnFamily: optionalTextSchema,
  parentImprovementSuggestions: optionalTextSchema,
  additionalComments: optionalTextSchema,
});

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
  enjoyedParts: z
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
  learningImprovementRating: rating1To5Schema,
  confidenceRating: rating1To5Schema,
  volunteerSupportRating: rating1To5Schema,
  studentEnjoyedMost: optionalTextSchema,
  studentImprovementSuggestions: optionalTextSchema,

  parentGuardianName: textSchema,
  parentGuardianRelationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE"]),
  parentPhone: optionalTextSchema,
  childBenefited: z.enum(["YES – GREATLY", "YES – SOMEWHAT", "NOT SURE", "NO"]),
  academicImprovementNoticed: z
    .enum(["YES – SIGNIFICANT", "YES – SOME", "NO NOTICEABLE CHANGE", "NOT SURE"])
    .optional(),
  confidenceBehaviorChange: z
    .enum(["YES – VERY POSITIVE", "SOME IMPROVEMENT", "NO CHANGE", "NOT SURE"])
    .optional(),
  mostValuableAspects: z
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
  parentSatisfactionRating: rating1To5Schema.optional(),
  programImpactOnChild: optionalTextSchema,
  parentImprovementSuggestions: optionalTextSchema,
  additionalComments: optionalTextSchema,
});

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

export const volunteerFeedbackBody = z.object({
  firstName: textSchema,
  surname: textSchema,
  programVolunteered: z.enum([
    "ASH",
    "TACOTS SCHOLARSHIP",
    "CAPACITY BUILDING",
    "CEDAR OUTREACHES",
  ]),
  specificProgramDetails: optionalTextSchema,
  volunteerDuration: z.enum(["< 3 MONTHS", "3–6 MONTHS", "6 MONTHS–1 YEAR", "> 1 YEAR"]).optional(),
  overallExperienceRating: rating1To5Schema,
  roleClarityRating: rating1To5Schema,
  teamSupportRating: rating1To5Schema,
  organizationRating: rating1To5Schema,
  programMadeImpact: z.enum(["YES – VERY STRONG", "YES – SOME", "NOT SURE", "NO"]).optional(),
  waysProgramHelped: z
    .array(
      z.enum([
        "IMPROVED ACADEMIC SUPPORT",
        "STUDENT CONFIDENCE",
        "MENTORSHIP",
        "SKILLS DEVELOPMENT",
        "UNDERSERVED COMMUNITIES",
      ]),
    )
    .optional(),
  activitiesInvolvedIn: z
    .array(
      z.enum([
        "TEACHING / TUTORING",
        "MENTORING",
        "EXTRACURRICULAR",
        "COMMUNITY OUTREACH",
        "EVENT SUPPORT",
        "COORDINATION",
        "TRAINING",
        "OTHER",
      ]),
    )
    .optional(),
  skillsDeveloped: z.enum(["YES", "SOMEWHAT", "NO"]).optional(),
  skillsGained: z
    .array(
      z.enum([
        "TEACHING",
        "COMMUNICATION",
        "LEADERSHIP",
        "MENTORSHIP",
        "TEAMWORK",
        "COMMUNITY ENGAGEMENT",
        "FACILITATION",
      ]),
    )
    .optional(),
  enjoyedMost: optionalTextSchema,
  challengesExperienced: optionalTextSchema,
  improvementSuggestions: optionalTextSchema,
  continueVolunteering: z.enum(["YES", "MAYBE", "NO"]).optional(),
  wouldRecommend: z.enum(["YES", "MAYBE", "NO"]).optional(),
  additionalComments: optionalTextSchema,
  submissionDate: z.coerce.date(),
});

export const createVolunteerFeedbackSchema = z.object({
  body: volunteerFeedbackBody,
});

export const updateVolunteerFeedbackSchema = z.object({
  body: volunteerFeedbackBody.partial(),
});

export const volunteerFeedbackParamsSchema = idSchema;

export const volunteerFeedbackQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});

export const outreachTrackerBody = z.object({
  outreachStartDate: z.coerce.date(),
  outreachEndDate: z.coerce.date(),
  outreachState: nigerianStateSchema,
  outreachLga: textSchema,
  outreachCity: textSchema,
  outreachCommunity: textSchema,
  numVolunteers: z.coerce.number().int().min(0),
  numBeneficiaries: z.coerce.number().int().min(0),
  outreachType: z.array(z.enum(["SOFT SKILLS", "VOCATIONAL SKILLS", "MEDICAL", "EDUCATIONAL"])),
  activityDescription: textSchema,
  impactStories: optionalTextSchema,
  challengesEncountered: optionalTextSchema,
  recommendations: optionalTextSchema,
  submittedBy: textSchema,
  submissionDate: z.coerce.date(),
});

export const createOutreachTrackerSchema = z.object({
  body: outreachTrackerBody,
  file: uploadedFileSchema.optional(),
});

export const updateOutreachTrackerSchema = z.object({
  body: outreachTrackerBody.partial(),
  file: uploadedFileSchema.optional(),
});

export const outreachTrackerParamsSchema = idSchema;

export const outreachTrackerQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
  }),
});

export const volunteerRegistrationBody = z.object({
  firstName: textSchema,
  middleName: optionalTextSchema,
  surname: textSchema,
  gender: genderSchema,
  dob: z.coerce.date(),
  age: z.coerce.number().int().min(16),
  phoneNumber: textSchema,
  emailAddress: emailSchema,
  homeAddress: textSchema,
  city: textSchema,
  state: nigerianStateSchema,
  occupation: optionalTextSchema,
  highestEducation: z
    .enum(["SECONDARY SCHOOL", "DIPLOMA / CERTIFICATE", "UNDERGRADUATE", "POSTGRADUATE", "OTHER"])
    .optional(),
  reasonForVolunteering: textSchema,
  volunteerAreas: z.array(
    z.enum(["ASH", "TACOTS", "CAPACITY BUILDING", "CEDAR OUTREACHES", "ADMINISTRATIVE SUPPORT"]),
  ),
  skillsToContribute: z
    .array(
      z.enum([
        "TEACHING",
        "MENTORING",
        "PUBLIC SPEAKING",
        "CREATIVE ARTS",
        "DIGITAL / ICT",
        "WRITING",
        "PROJECT COORDINATION",
        "COMMUNITY MOBILIZATION",
        "ADMIN",
        "GRAPHICS DESIGN",
        "PHOTOGRAPHY / VIDEOGRAPHY",
        "SOCIAL MEDIA",
        "DATA MANAGEMENT",
        "OTHER",
      ]),
    )
    .optional(),
  availability: z.array(z.enum(["WEEKDAYS", "WEEKENDS", "OCCASIONAL EVENTS", "FLEXIBLE"])),
  commitmentDuration: z.enum(["3 MONTHS", "6 MONTHS", "1 YEAR", "MORE THAN 1 YEAR"]).optional(),
  ashInterest: yesNoSchema.optional(),
  ashSaturdayAvailability: z
    .enum(["EVERY SATURDAY", "TWO SATURDAYS A MONTH", "ONE SATURDAY A MONTH", "OCCASIONALLY"])
    .optional(),
  ashAcademicArea: z
    .enum(["LITERACY (READING & WRITING)", "NUMERACY (MATHEMATICS)", "BOTH"])
    .optional(),
  ashExtracurricular: z
    .array(
      z.enum([
        "DRAMA / THEATRE",
        "MUSIC / SINGING",
        "DANCE",
        "PUBLIC SPEAKING",
        "CREATIVE WRITING",
        "SPORTS / GAMES",
        "DIGITAL SKILLS",
        "ARTS AND CRAFTS",
      ]),
    )
    .optional(),
  safeguardingAgreement: yesNoSchema,
  mediaConsent: z.boolean().default(false),
  additionalInfo: optionalTextSchema,
  registrationDate: z.coerce.date(),
  status: statusSchema.default("pending").optional(),
});

export const createVolunteerRegistrationSchema = z.object({
  body: volunteerRegistrationBody,
});

export const updateVolunteerRegistrationSchema = z.object({
  body: volunteerRegistrationBody.partial(),
});

export const volunteerRegistrationParamsSchema = idSchema;

export const volunteerRegistrationQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    status: statusSchema.optional(),
  }),
});

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
  catholicSacraments: z
    .array(z.enum(["BAPTISM", "FIRST HOLY COMMUNION", "CONFIRMATION", "NONE YET"]))
    .optional(),
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
  guardianRelationship: z
    .enum(["GRANDPARENT", "AUNT/UNCLE", "SIBLING", "RELATION", "COMMUNITY GUARDIAN", "OTHER"])
    .optional(),
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
    "₦100,000–₦300,000",
    "₦300,001–₦600,000",
    "₦600,001–₦1,000,000",
    "ABOVE ₦1,000,000",
  ]),
  incomeSources: z.array(
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
  supportTypesNeeded: z.array(
    z.enum(["TUITION (SCHOOL FEES)", "SCHOOL RESOURCES", "TRANSPORTATION", "OTHER"]),
  ),
  otherImportantInfo: optionalTextSchema,

  disciplineRating: rating1To5Schema,
  responsibilityRating: rating1To5Schema,
  careerGoal: textSchema,
  studentStatement: optionalTextSchema,
  declarationConfirmed: z.boolean().default(false),
  adminStatus: adminStatusSchema.default("KEEP IN VIEW").optional(),
});

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

export const tacotsRecommendationParamsSchema = idSchema;

export const tacotsRecommendationQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    adminStatus: adminStatusSchema.optional(),
  }),
});

export const tacotsOnboardingBody = z.object({
  studentId: z.uuid("Invalid ID"),
  onboardingDate: z.coerce.date(),

  hasMentalHealthDiagnosis: z.enum(["YES", "NO", "NOT SURE"]),
  diagnosedConditions: z
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
  behavioralIndicators: z.array(
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
  chronicConditions: z
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
  allergies: z.array(
    z.enum([
      "NO KNOWN ALLERGIES",
      "FOOD ALLERGIES",
      "DRUG ALLERGIES",
      "ENVIRONMENTAL ALLERGIES",
      "OTHER",
    ]),
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

  studentCommitment: z.boolean().default(false).optional(),
  parentGuardianCommitment: z.boolean().default(false),
  programOfficerNotes: optionalTextSchema,
  supportTypesApproved: z
    .array(z.enum(["TUITION (SCHOOL FEES)", "SCHOOL RESOURCES", "TRANSPORTATION", "OTHER"]))
    .optional(),
  mentorName: optionalTextSchema,
  sponsorName: optionalTextSchema,
  additionalInfo: optionalTextSchema,
});

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
  }),
});

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
    academicSession: academicSessionSchema.optional(),
    term: tacotsAcademicTermSchema.optional(),
  }),
});

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
  vocationalSkill: z
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
  newSchoolName: optionalTextSchema,
  completedSecondaryElsewhere: z.enum(["YES", "NO", "CURRENTLY STUDYING", "NOT SURE"]).optional(),
  programImpactDescription: optionalTextSchema,
  programImpactRating: rating1To10Schema.optional(),
  additionalSituationInfo: optionalTextSchema,
  completedBy: textSchema,
  submissionDate: z.coerce.date(),
});

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
  }),
});
