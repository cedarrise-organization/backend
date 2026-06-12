//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import { successResponse } from "../../utils/responseHandler.js";
import {
  submitVolunteerRegistration,
  listVolunteers,
  getVolunteer,
  deleteVolunteer,
  updateVolunteerStatus,
  exportVolunteerRegistrationTableToCSV,
  submitVolunteerFeedback,
  listVolunteerFeedback,
  getVolunteerFeedback,
  deleteVolunteerFeedback,
  exportVolunteerFeedbackTableToCSV,
} from "../../services/volunteer.services.js";

export const submitVolunteerRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    middleName,
    surname,
    gender,
    dob,
    age,
    phoneNumber,
    emailAddress,
    homeAddress,
    city,
    state,
    occupation,
    highestEducation,
    reasonForVolunteering,
    volunteerAreas,
    skillsToContribute,
    availability,
    commitmentDuration,
    ashSaturdayAvailability,
    ashAcademicArea,
    ashExtracurricular,
    safeguardingAgreement,
    mediaConsent,
    additionalInfo,
  } = req.body;

  try {
    const response = await submitVolunteerRegistration({
      firstName,
      middleName,
      surname,
      gender,
      dob,
      age,
      phoneNumber,
      emailAddress,
      homeAddress,
      city,
      state,
      occupation,
      highestEducation,
      reasonForVolunteering,
      volunteerAreas,
      skillsToContribute,
      availability,
      commitmentDuration,
      ashSaturdayAvailability,
      ashAcademicArea,
      ashExtracurricular,
      safeguardingAgreement,
      mediaConsent,
      additionalInfo,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};
export const listVolunteersController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, orderBy, search, status, sortBy } = req.qtransformed;
  try {
    const response = await listVolunteers(page, limit, orderBy, search, status, sortBy);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};
export const getVolunteerController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getVolunteer(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const updateVolunteerStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  const { status } = req.qtransformed;

  try {
    const response = await updateVolunteerStatus(id, status);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const deleteVolunteerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteVolunteer(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};
export const exportVolunteerRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportVolunteerRegistrationTableToCSV();

    const fields = [
      "id",
      "firstName",
      "middleName",
      "surname",
      "gender",
      "dob",
      "age",
      "phoneNumber",
      "emailAddress",
      "homeAddress",
      "city",
      "state",
      "occupation",
      "highestEducation",
      "reasonForVolunteering",
      "volunteerAreas",
      "skillsToContribute",
      "availability",
      "commitmentDuration",
      "ashSaturdayAvailability",
      "ashAcademicArea",
      "ashExtracurricular",
      "safeguardingAgreement",
      "mediaConsent",
      "additionalInfo",
      "status",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="volunteer_registration.csv"');

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const submitVolunteerFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    surname,
    programVolunteered,
    specificProgramDetails,
    volunteerDuration,
    overallExperienceRating,
    roleClarityRating,
    teamSupportRating,
    organizationRating,
    programMadeImpact,
    waysProgramHelped,
    activitiesInvolvedIn,
    skillsDeveloped,
    skillsGained,
    enjoyedMost,
    challengesExperienced,
    improvementSuggestions,
    continueVolunteering,
    wouldRecommend,
    additionalComments,
    submissionDate,
  } = req.body;
  try {
    const response = await submitVolunteerFeedback({
      firstName,
      surname,
      programVolunteered,
      specificProgramDetails,
      volunteerDuration,
      overallExperienceRating,
      roleClarityRating,
      teamSupportRating,
      organizationRating,
      programMadeImpact,
      waysProgramHelped,
      activitiesInvolvedIn,
      skillsDeveloped,
      skillsGained,
      enjoyedMost,
      challengesExperienced,
      improvementSuggestions,
      continueVolunteering,
      wouldRecommend,
      additionalComments,
      submissionDate,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const listVolunteerFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, search } = req.qtransformed;
  try {
    const response = await listVolunteerFeedback(page, limit, search);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};
export const getVolunteerFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getVolunteerFeedback(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const deleteVolunteerFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteVolunteerFeedback(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};
export const exportVolunteerFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportVolunteerFeedbackTableToCSV();

    const fields = [
      "id",
      "firstName",
      "surname",
      "programVolunteered",
      "specificProgramDetails",
      "volunteerDuration",
      "overallExperienceRating",
      "roleClarityRating",
      "teamSupportRating",
      "organizationRating",
      "programMadeImpact",
      "waysProgramHelped",
      "activitiesInvolvedIn",
      "skillsDeveloped",
      "skillsGained",
      "enjoyedMost",
      "challengesExperienced",
      "improvementSuggestions",
      "continueVolunteering",
      "wouldRecommend",
      "additionalComments",
      "submissionDate",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="volunteer_feedback.csv"');

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const example = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await example();
    // return successResponse(res, response.code, response.message, response.data)
  } catch (error) {
    next(error);
  }
};
