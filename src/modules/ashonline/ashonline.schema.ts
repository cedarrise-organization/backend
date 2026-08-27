//MODELS
import * as z from "zod";
import {
  statusSchema,
  baseQueryBody,
  resultFileSchema,
} from "../../db/globalschema/global.schema.js";

// ENUMS
const ashClassSchema = z.enum([
  "KG / NURSERY 1",
  "KG / NURSERY 2",
  "KG / NURSERY 3",
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

const tutoringDaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const subjectOfInterestSchema = z.enum([
  "MATHEMATICS",
  "ENGLISH",
  "SCIENCE",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "LITERATURE IN ENGLISH",
  "GOVERNMENT",
  "FINANCIAL ACCOUNTING",
  "COMMERCE",
  "OTHER",
]);

// CREATE
export const ashOnlineRegistrationSchema = z.object({
  childFirstName: z
    .string("child first name is required")
    .min(1, "child first name is required")
    .transform((v) => v.toLowerCase().trim()),
  childSurname: z
    .string("child surname is required")
    .min(1, "child surname is required")
    .transform((v) => v.toLowerCase().trim()),
  dob: z.coerce.date("invalid date of birth"),
  age: z.coerce
    .number("age is required")
    .int("age must be a whole number")
    .min(3, "age must be at least 3")
    .max(17, "age must not be greater than 17"),
  childClass: ashClassSchema,
  schoolName: z
    .string("school name is required")
    .min(1, "school name is required")
    .transform((v) => v.toLowerCase().trim()),
  schoolLocation: z
    .string("school location is required")
    .min(1, "school location is required")
    .transform((v) => v.toLowerCase().trim()),
  childEmail: z.email("invalid child email").transform((v) => v.toLowerCase().trim()),
  tutoringDays: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(tutoringDaySchema).min(1, "select at least one tutoring day"),
  ),
  timeAvailability: z
    .string("time availability is required")
    .min(1, "time availability is required")
    .transform((v) => v.toLowerCase().trim()),
  subjectsOfInterest: z.preprocess(
    (v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    },
    z.array(subjectOfInterestSchema).min(1, "select at least one subject"),
  ),
  prevTermClassAverage: z
    .string("previous term class average is required")
    .min(1, "previous term class average is required")
    .transform((v) => v.trim()),
  prevTermClassPosition: z
    .string("previous term class position is required")
    .min(1, "previous term class position is required")
    .transform((v) => v.trim()),
  parentName: z
    .string("parent name is required")
    .min(1, "parent name is required")
    .transform((v) => v.toLowerCase().trim()),
  parentPhone: z
    .string("parent phone is required")
    .min(1, "parent phone is required")
    .transform((v) => v.trim()),
  parentEmail: z.email("invalid parent email").transform((v) => v.toLowerCase().trim()),
  parentalConsent: z.coerce.boolean().default(false),
});

export type AshOnlineRegistrationBodyType = z.infer<typeof ashOnlineRegistrationSchema>;

export const createAshOnlineRegistrationSchema = z.object({
  body: ashOnlineRegistrationSchema,
  files: z.object({
    currentCurriculum: resultFileSchema.optional(),
    academicReport: resultFileSchema.optional(),
  }),
});

// PARAMS
export const ashOnlineRegistrationParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

// QUERY
export const ashOnlineRegistrationQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    status: statusSchema,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .enum([
          "childFirstName",
          "childSurname",
          "childClass",
          "childEmail",
          "schoolName",
          "tutoringDays",
          "timeAvailability",
          "createdAt",
        ])
        .default("createdAt"),
    ),
  }),
});

// UPDATE
export const updateAshOnlineStatusSchema = z.object({
  query: z.object({
    status: statusSchema,
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const updateAshOnlineRegistrationSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),

  body: z.object({
    childFirstName: z.string().min(1).optional(),
    childSurname: z.string().min(1).optional(),
    dob: z.coerce.date().optional(),
    age: z.coerce.number().int().min(3).max(17).optional(),
    childClass: ashClassSchema.optional(),
    schoolName: z.string().min(1).optional(),
    schoolLocation: z.string().min(1).optional(),
    childEmail: z.email().optional(),
    tutoringDays: z.preprocess((v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    }, z.array(tutoringDaySchema).min(1, "select at least one tutoring day").optional()),
    timeAvailability: z.string().min(1).optional(),
    subjectsOfInterest: z.preprocess((v) => {
      if (v === "" || v == null) return undefined;
      // already an array
      if (Array.isArray(v)) return v;
      // single string value
      if (typeof v === "string") return [v];
      return v;
    }, z.array(subjectOfInterestSchema).min(1, "select at least one subject").optional()),
    prevTermClassAverage: z.string().min(1).optional(),
    prevTermClassPosition: z.string().min(1).optional(),
    parentName: z.string().min(1).optional(),
    parentPhone: z.string().min(1).optional(),
    parentEmail: z.email().optional(),
    parentalConsent: z.boolean().optional(),
  }),
  files: z
    .object({
      currentCurriculum: resultFileSchema.optional(),
      academicReport: resultFileSchema.optional(),
    })
    .optional(),
});
