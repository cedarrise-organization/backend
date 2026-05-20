//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { submitRegistration, submitVolunteerFeedback } from "../../services/volunteer.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";

export const submitRegistrationController = async (
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
    ashInterest,
    ashSaturdayAvailability,
    ashAcademicArea,
    ashExtracurricular,
    safeguardingAgreement,
    mediaConsent,
    additionalInfo,
    registrationDate,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload a file");

  try {
    const response = await submitRegistration(req, {
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
      ashInterest,
      ashSaturdayAvailability,
      ashAcademicArea,
      ashExtracurricular,
      safeguardingAgreement,
      mediaConsent,
      additionalInfo,
      registrationDate,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
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
