//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../lib/error.js";
import { successResponse } from "../../utils/responseHandler.js";
import { Parser } from "json2csv";
import {
  createOutreach,
  getOneOutreach,
  deleteOutreach,
  listOutreaches,
  exportOutreachTrackerTableToCSV,
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

  try {
    const response = await createOutreach(
      {
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
      },
      (req as any).correlationId,
    );

    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};
export const getOneOutreachController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getOneOutreach(id);
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};
export const listAllOutreachController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search, sortBy } = req.qtransformed;

  try {
    const response = await listOutreaches(
      page,
      limit,
      orderBy,
      search,
      sortBy,
      (req as any).correlationId,
    );
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};
export const deleteOutreachController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteOutreach(id, (req as any).correlationId);
    return successResponse(res, response.code, response.message, null, {
      correlationId: (req as any).correlationId,
    });
  } catch (err) {
    next(err);
  }
};
export const exportOutreachTrackerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportOutreachTrackerTableToCSV();

    const fields = [
      "id",
      "outreachStartDate",
      "outreachEndDate",
      "outreachState",
      "outreachLga",
      "outreachCity",
      "outreachCommunity",
      "numVolunteers",
      "numBeneficiaries",
      "outreachType",
      "activityDescription",
      "impactStories",
      "challengesEncountered",
      "recommendations",
      "submittedBy",
      "submissionDate",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="outreach_tracker.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
  } catch (error) {
    next(error);
  }
};
