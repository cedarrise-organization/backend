//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import { Parser } from "json2csv";
import {
  submitAshOnlineRegistration,
  listAshOnlineRegistrations,
  getAshOnlineRegistration,
  updateAshOnlineStudentStatus,
  deleteAshOnlineRegistration,
  exportAshOnlineStudentTableToCSV,
} from "../../services/ashonline.services.js";

// ASH ONLINE REGISTRATION
export const submitRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    childFirstName,
    childSurname,
    dob,
    age,
    childClass,
    schoolName,
    schoolLocation,
    childEmail,
    tutoringDays,
    timeAvailability,
    subjectsOfInterest,
    prevTermClassAverage,
    prevTermClassPosition,
    parentName,
    parentPhone,
    parentEmail,
    parentalConsent,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload the relevant file");

  try {
    const response = await submitAshOnlineRegistration(
      req,
      {
        childFirstName,
        childSurname,
        dob,
        age,
        childClass,
        schoolName,
        schoolLocation,
        childEmail,
        tutoringDays,
        timeAvailability,
        subjectsOfInterest,
        prevTermClassAverage,
        prevTermClassPosition,
        parentName,
        parentPhone,
        parentEmail,
        parentalConsent,
      },
      (req as any).correlationId,
    );

    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (err) {
    next(err);
  }
};

export const listRegistrationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy, search, status, sortBy } = req.qtransformed;
  try {
    const response = await listAshOnlineRegistrations(
      page,
      limit,
      orderBy,
      search,
      status,
      sortBy,
      (req as any).correlationId,
    );
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getAshOnlineRegistration(id);
    return successResponse(res, response.code, response.message, response.data, {
      correlationId: (req as any).correlationId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAshOnlineStudentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  const { status } = req.qtransformed;
  try {
    const response = await updateAshOnlineStudentStatus(id, status, (req as any).correlationId);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const deleteRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteAshOnlineRegistration(id, (req as any).correlationId);
    return successResponse(res, response.code, response.message, null, response.meta);
  } catch (error) {
    next(error);
  }
};

export const exportAshOnlineStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportAshOnlineStudentTableToCSV();

    const fields = [
      "id",
      "childFirstName",
      "childSurname",
      "dob",
      "age",
      "childClass",
      "schoolName",
      "schoolLocation",
      "childEmail",
      "tutoringDays",
      "timeAvailability",
      "subjectsOfInterest",
      "currentCurriculumUrl",
      "currentCurriculumPublicId",
      "academicReportUrl",
      "academicReportPublicId",
      "prevTermClassAverage",
      "prevTermClassPosition",
      "parentName",
      "parentPhone",
      "parentEmail",
      "parentalConsent",
      "status",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="ash_online_students.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
  } catch (error) {
    next(error);
  }
};
