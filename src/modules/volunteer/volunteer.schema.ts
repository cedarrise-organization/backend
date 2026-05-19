//MODELS
import * as z from "zod";
import {
  textSchema,
  optionalTextSchema,
  genderSchema,
  nigerianStateSchema,
  yesNoSchema,
  statusSchema,
  idSchema,
  baseQueryBody,
  rating1To5Schema,
  emailSchema
} from "../../db/globalschema/global.schema.js";


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

