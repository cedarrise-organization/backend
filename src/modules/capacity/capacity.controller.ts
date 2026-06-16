//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { Parser } from "json2csv";
import {
  createEvaluation,
  listAllEvaluation,
  getEvaluation,
  deleteEvaluation,
  exportCapacityEvaluationTableToCSV,
} from "../../services/capacity.services.js";

export const createEvaluationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    programName,
    programType,
    programDate,
    location,
    programCoordinator,
    numberOfSponsors,
    listOfSponsors,
    sponsorshipType,
    partnerOrganizations,
    partnershipLevel,
    numberOfParticipants,
    targetAudience,
    numberOfFacilitators,
    numberOfVolunteers,
    participantEngagementLevel,
    programObjectives,
    objectiveAchievement,
    programOutcome,
    programImpact,
    majorActivities,
    effectiveActivities,
    venueSuitability,
    timeManagement,
    resourceAvailability,
    communicationAndCoordination,
    teamworkAmongOrganizers,
    challengesEncountered,
    challengesAddressed,
    lessonsLearned,
    budgetAllocated,
    budgetUtilized,
    wereResourcesAdequate,
    inadequateResourcesExplanation,
    overallSuccess,
    recommendTheProgram,
    improvementSuggestions,
    recommendFuturePrograms,
    name,
    role,
    dateSubmitted,
  } = req.body;
  try {
    const response = await createEvaluation({
      programName,
      programType,
      programDate,
      location,
      programCoordinator,
      numberOfSponsors,
      listOfSponsors,
      sponsorshipType,
      partnerOrganizations,
      partnershipLevel,
      numberOfParticipants,
      targetAudience,
      numberOfFacilitators,
      numberOfVolunteers,
      participantEngagementLevel,
      programObjectives,
      objectiveAchievement,
      programOutcome,
      programImpact,
      majorActivities,
      effectiveActivities,
      venueSuitability,
      timeManagement,
      resourceAvailability,
      communicationAndCoordination,
      teamworkAmongOrganizers,
      challengesEncountered,
      challengesAddressed,
      lessonsLearned,
      budgetAllocated,
      budgetUtilized,
      wereResourcesAdequate,
      inadequateResourcesExplanation,
      overallSuccess,
      recommendTheProgram,
      improvementSuggestions,
      recommendFuturePrograms,
      name,
      role,
      dateSubmitted,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
export const listAllEvaluationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search, sortBy} = req.qtransformed;
  try {
    const response = await listAllEvaluation(page, limit, orderBy, search, sortBy);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};
export const getEvaluationController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id;
  try {
    const response = await getEvaluation(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
export const deleteEvaluationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id;
  try {
    const response = await deleteEvaluation(id);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
export const exportCapacityEvaluationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportCapacityEvaluationTableToCSV();

    const fields = [
      "id",
      "programName",
      "programType",
      "programDate",
      "location",
      "programCoordinator",
      "numberOfSponsors",
      "listOfSponsors",
      "sponsorshipType",
      "partnerOrganizations",
      "partnershipLevel",
      "numberOfParticipants",
      "targetAudience",
      "numberOfFacilitators",
      "numberOfVolunteers",
      "participantEngagementLevel",
      "programObjectives",
      "objectiveAchievement",
      "programOutcome",
      "programImpact",
      "majorActivities",
      "effectiveActivities",
      "venueSuitability",
      "timeManagement",
      "resourceAvailability",
      "communicationAndCoordination",
      "teamworkAmongOrganizers",
      "challengesEncountered",
      "challengesAddressed",
      "lessonsLearned",
      "budgetAllocated",
      "budgetUtilized",
      "wereResourcesAdequate",
      "inadequateResourcesExplanation",
      "overallSuccess",
      "recommendTheProgram",
      "improvementSuggestions",
      "recommendFuturePrograms",
      "name",
      "role",
      "dateSubmitted",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="capacity_building_evaluation.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
  } catch (error) {
    next(error);
  }
};
