//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import {
  submitVolunteerRegistration,
  listVolunteers,
  getVolunteer,
  deleteVolunteer,
  submitVolunteerFeedback,
  listVolunteerFeedback,
  getVolunteerFeedback,
  deleteVolunteerFeedback,
  updateVolunteerStatus,
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
  const { page, limit, status, sortBy } = req.qtransformed;
  try {
    const response = await listVolunteers(page, limit, status, sortBy);
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
  const { page, limit } = req.qtransformed;
  try {
    const response = await listVolunteerFeedback(page, limit);
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

export const example = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await example();
    // return successResponse(res, response.code, response.message, response.data)
  } catch (error) {
    next(error);
  }
};
