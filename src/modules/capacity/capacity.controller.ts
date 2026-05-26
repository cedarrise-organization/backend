//CONTROLLER
import { Request, Response, NextFunction } from "express";
import {
  createEvaluation,
  listAllEvaluation,
  getEvaluation,
  deleteEvaluation,
} from "../../services/capacity.services.js";
import { successResponse } from "../../utils/responseHandler.js";

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
  const { page, limit } = req.qtransformed;
  try {
    const response = await listAllEvaluation(page, limit);
    return successResponse(res, response.code, response.message, response.data);
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
