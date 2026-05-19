//MODELS
import * as z from "zod";
import {
  textSchema,
  optionalTextSchema,
  nigerianStateSchema,
  idSchema,
  baseQueryBody,
  uploadedFileSchema,
} from "../../db/globalschema/global.schema.js";

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
