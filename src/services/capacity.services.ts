import { sql, eq, max, sum, asc, desc, count, countDistinct } from "drizzle-orm";
import { CapacitybuildingevaluationbodyType } from "../modules/capacity/capacity.schema.js";
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import { capacityBuildingEvaluation } from "../db/models/admin.js";
import { DELETE_EVENTS } from "../events/delete.events.js";
import { appEvents } from "../lib/events.js";
import db from "../db/db.js";

const sortMap = {
  programName: capacityBuildingEvaluation.programName,
  programType: capacityBuildingEvaluation.programType,
  programDate: capacityBuildingEvaluation.programDate,
  location: capacityBuildingEvaluation.location,
  numberOfParticipants: capacityBuildingEvaluation.numberOfParticipants,
  programCoordinator: capacityBuildingEvaluation.programCoordinator,
  createdAt: capacityBuildingEvaluation.createdAt,
} as const;

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

  appEvents.emit(DELETE_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:capacity:*`,
    event: "CREATE CAPACITY EVALUATION RECORD",
  });

  return {
    code: 200,
    message: "Evaluation submitted successfully",
    data: evaluation,
  };
};
export const getCapacityCardsData = async () => {
  /// cache
  const key = "cedarrise:capacitycardsdata";
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return cacheRes;
  }
  ///
  const [
    [capacityParticipantsImpacted],
    [capacityOrganizationsPartneredWith],
    [capacityVolunteersEngaged],
    [capacityWorkshopsConducted],
  ] = await Promise.all([
    // capacityParticipantsImpacted
    db
      .select({ value: sum(capacityBuildingEvaluation.numberOfParticipants) })
      .from(capacityBuildingEvaluation),
    // capacityOrganizationsPartneredWith
    db
      .select({
        value: countDistinct(sql`lower(trim(${capacityBuildingEvaluation.partnerOrganizations}))`),
      })
      .from(capacityBuildingEvaluation), // transform values to lowercase to avoid counting similar records twice
    // capacityVolunteersEngaged
    db
      .select({ value: max(capacityBuildingEvaluation.numberOfVolunteers) })
      .from(capacityBuildingEvaluation),
    // capacityWorkshopsConducted
    db.select({ value: count(capacityBuildingEvaluation.id) }).from(capacityBuildingEvaluation), // Count ids because it has an index
  ]);

  /// cache set
  await cacheSet(
    key,
    {
      participantsImpacted: Number(capacityParticipantsImpacted?.value ?? 0),
      organizationsPartneredWith: Number(capacityOrganizationsPartneredWith?.value ?? 0),
      volunteersEngaged: Number(capacityVolunteersEngaged?.value ?? 0),
      workshopsConducted: Number(capacityWorkshopsConducted?.value ?? 0),
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );

  return {
    participantsImpacted: Number(capacityParticipantsImpacted?.value ?? 0),
    organizationsPartneredWith: Number(capacityOrganizationsPartneredWith?.value ?? 0),
    volunteersEngaged: Number(capacityVolunteersEngaged?.value ?? 0),
    workshopsConducted: Number(capacityWorkshopsConducted?.value ?? 0),
  };
};
export const listAllEvaluation = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof sortMap,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${capacityBuildingEvaluation.programName}), 'A') ||
      setweight(to_tsvector('english', ${capacityBuildingEvaluation.programType}), 'A') ||
      setweight(to_tsvector('english', ${capacityBuildingEvaluation.location}), 'A') ||
      setweight(to_tsvector('english', ${capacityBuildingEvaluation.programCoordinator}), 'A')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [evaluation, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(capacityBuildingEvaluation)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(capacityBuildingEvaluation.id) })
        .from(capacityBuildingEvaluation)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

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
  }

  /// cache
  const key = `cedarrise:capacity:evaluation:${page}:${limit}:${orderBy}:${sortBy}`;
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
        metadata: cacheRes.metadata,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? capacityBuildingEvaluation.createdAt;
  const orderby =
    sortColumn === capacityBuildingEvaluation.createdAt
      ? [desc(capacityBuildingEvaluation.createdAt)]
      : [sortDirection(sortColumn), desc(capacityBuildingEvaluation.createdAt)];

  const [evaluation, [totalDocuments], metaData] = await Promise.all([
    db
      .select()
      .from(capacityBuildingEvaluation)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(capacityBuildingEvaluation.id) }).from(capacityBuildingEvaluation),
    getCapacityCardsData(),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: evaluation, totalPages, metadata: metaData }, CACHE_TTL.FORM_DATA);
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
      metadata: metaData,
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
  await db.delete(capacityBuildingEvaluation).where(eq(capacityBuildingEvaluation.id, id));

  appEvents.emit(DELETE_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:capacity:*`,
    event: "DELETE CAPACITY EVALUATION RECORD",
  });
  
  return {
    code: 200,
    message: "Outreach deleted successfully",
  };
};
export const exportCapacityEvaluationTableToCSV = async () => {
  const data = await db.select().from(capacityBuildingEvaluation);
  return data;
};
