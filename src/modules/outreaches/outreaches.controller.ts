//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../lib/error.js";
import { successResponse } from "../../utils/responseHandler.js";
import {
  createOutreach,
  getOneOutreach,
  deleteOutreach,
  listOutreaches,
} from "../../services/outreaches.services.js";

export const createOutreachController = async (req: Request, res: Response, next: NextFunction) => {
  const {
    outreachStartDate,
    outreachEndDate,
    outreachState,
    outreachLga,
    outreachCity,
    outreachCommunity,
    numVolunteers,
    numBeneficiaries,
    outreachType,
    activityDescription,
    impactStories,
    challengesEncountered,
    recommendations,
    submittedBy,
    submissionDate,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload a file");

  try {
    const response = await createOutreach({
      outreachStartDate,
      outreachEndDate,
      outreachState,
      outreachLga,
      outreachCity,
      outreachCommunity,
      numVolunteers,
      numBeneficiaries,
      outreachType,
      activityDescription,
      impactStories,
      challengesEncountered,
      recommendations,
      submittedBy,
      submissionDate,
    });

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const getOneOutreachController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getOneOutreach(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const listAllOutreachController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit } = req.qtransformed;

  try {
    const response = await listOutreaches(page, limit);
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const deleteOutreachController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteOutreach(id);
    return successResponse(res, response.code, response.message);
  } catch (err) {
    next(err);
  }
};
