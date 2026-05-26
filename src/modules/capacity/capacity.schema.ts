//MODELS
import * as z from "zod";
import {
  textSchema,
  optionalTextSchema,
  numericSchema,
  idSchema,
  baseQueryBody,
} from "../../db/globalschema/global.schema.js";

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
  wereResourcesAdequate: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["yes", "no"]).optional(),
  ),
  inadequateResourcesExplanation: optionalTextSchema,
  overallSuccess: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["Poor", "Fair", "Good", "Very Good", "Excellent"]).optional(),
  ),
  recommendTheProgram: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(["yes", "no"]).optional(),
  ),
  improvementSuggestions: optionalTextSchema,
  recommendFuturePrograms: optionalTextSchema,

  name: textSchema,
  role: textSchema,
  dateSubmitted: z.coerce.date(),
});

export type CapacitybuildingevaluationbodyType = z.infer<typeof capacityBuildingEvaluationBody>

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
