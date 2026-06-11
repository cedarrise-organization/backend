import { CapacitybuildingevaluationbodyType } from "../modules/capacity/capacity.schema.js";
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import { capacityBuildingEvaluation } from "../db/models/admin.js";
import { uploadToCloudinary } from "../utils/storage.util.js";
import { UploadApiResponse } from "cloudinary";
import { sql, eq, asc, count } from "drizzle-orm";
import { Request } from "express";
import db from "../db/db.js";

export const createEvaluation = async (options: CapacitybuildingevaluationbodyType) => {
  const [evaluation] = await db
    .insert(capacityBuildingEvaluation)
    .values({
      programName: options.programName,
      programType: options.programType,
      programDate: sql`TO_DATE(${options.programDate}, 'YYYY-MM-DD')`,
      location: options.location,
      programCoordinator: options.programCoordinator,
      numberOfSponsors: options.numberOfSponsors,
      listOfSponsors: options.listOfSponsors,
      sponsorshipType: options.sponsorshipType,
      partnerOrganizations: options.partnerOrganizations,
      partnershipLevel: options.partnershipLevel,
      numberOfParticipants: options.numberOfParticipants,
      targetAudience: options.targetAudience,
      numberOfFacilitators: options.numberOfFacilitators,
      numberOfVolunteers: options.numberOfVolunteers,
      participantEngagementLevel: options.participantEngagementLevel,
      programObjectives: options.programObjectives,
      objectiveAchievement: options.objectiveAchievement,
      programOutcome: options.programOutcome,
      programImpact: options.programImpact,
      majorActivities: options.majorActivities,
      effectiveActivities: options.effectiveActivities,
      venueSuitability: options.venueSuitability,
      timeManagement: options.timeManagement,
      resourceAvailability: options.resourceAvailability,
      communicationAndCoordination: options.communicationAndCoordination,
      teamworkAmongOrganizers: options.teamworkAmongOrganizers,
      challengesEncountered: options.challengesEncountered,
      challengesAddressed: options.challengesAddressed,
      lessonsLearned: options.lessonsLearned,
      budgetAllocated: options.budgetAllocated,
      budgetUtilized: options.budgetUtilized,
      wereResourcesAdequate: options.wereResourcesAdequate,
      inadequateResourcesExplanation: options.inadequateResourcesExplanation,
      overallSuccess: options.overallSuccess,
      recommendTheProgram: options.recommendTheProgram,
      improvementSuggestions: options.improvementSuggestions,
      recommendFuturePrograms: options.recommendFuturePrograms,
      name: options.name,
      role: options.role,
      dateSubmitted: sql`TO_DATE(${options.dateSubmitted}, 'YYYY-MM-DD')`,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:capacity:evaluation:${evaluation?.id}`,
    evaluation,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 200,
    message: "Evaluation submitted successfully",
    data: evaluation,
  };
};

export const listAllEvaluation = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:capacity:evaluation:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "All evaluation found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
      },
    };
  }
  ///
  const [evaluation, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(capacityBuildingEvaluation)
      .orderBy(asc(capacityBuildingEvaluation.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(capacityBuildingEvaluation.id) }).from(capacityBuildingEvaluation),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: evaluation, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "All evaluation found successfully",
    data: evaluation,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
    },
  };
};

export const getEvaluation = async (id: string) => {
  /// cache
  const key = `cedarrise:capacity:evaluation:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Evaluation found successfully",
      data: cacheRes,
    };
  }
  ///

  const [evaluation] = await db
    .select()
    .from(capacityBuildingEvaluation)
    .where(eq(capacityBuildingEvaluation.id, id));

  /// cache set
  await cacheSet(key, evaluation, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Evaluation found successfully",
    data: evaluation,
  };
};

export const deleteEvaluation = async (id: string) => {
  const [evaluation] = await db
    .delete(capacityBuildingEvaluation)
    .where(eq(capacityBuildingEvaluation.id, id))
    .returning();

  /// cache Del
  await cacheDel(`cedarrise:capacity:evaluation:${evaluation?.id}`);
  ///

  return {
    code: 200,
    message: "Outreach deleted successfully",
  };
};
export const exportCapacityEvaluationTableToCSV = async () => {
  const data = await db.select().from(capacityBuildingEvaluation);
  return data;
};
