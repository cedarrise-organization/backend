//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { submitFeedback, submitRegistration } from "../../services/ash.services.js";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";

export const submitRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    programType,
    firstName,
    middleName,
    surname,
    gender,
    age,
    dob,
    primaryLanguage,
    homeAddress,
    studentPhone,
    schoolName,
    schoolTown,
    schoolLga,
    schoolState,
    currentClass,
    classPositionLastTerm,
    prevAfterschoolProgram,
    reasonForJoining,
    fathersName,
    fathersPhone,
    fathersOccupation,
    mothersName,
    mothersPhone,
    mothersOccupation,
    guardianName,
    guardianRelationship,
    guardianPhone,
    guardianOccupation,
    householdIncomeRange,
    hasLearningCondition,
    learningConditions,
    parentConsent,
    declarationConfirmed,
    assignedMentor,
    pretestScore,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload the relevant file");

  try {
    const response = await submitRegistration(req, {
      programType,
      firstName,
      middleName,
      surname,
      gender,
      age,
      dob,
      primaryLanguage,
      homeAddress,
      studentPhone,
      schoolName,
      schoolTown,
      schoolLga,
      schoolState,
      currentClass,
      classPositionLastTerm,
      prevAfterschoolProgram,
      reasonForJoining,
      fathersName,
      fathersPhone,
      fathersOccupation,
      mothersName,
      mothersPhone,
      mothersOccupation,
      guardianName,
      guardianRelationship,
      guardianPhone,
      guardianOccupation,
      householdIncomeRange,
      hasLearningCondition,
      learningConditions,
      parentConsent,
      declarationConfirmed,
      assignedMentor,
      pretestScore,
    });

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const submitFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const {
    studentFirstName,
    studentSurname,
    schoolName,
    currentClass,
    attendanceFrequency,
    enjoyedParts,
    learningImprovementRating,
    confidenceRating,
    volunteerSupportRating,
    studentEnjoyedMost,
    studentImprovementSuggestions,
    parentGuardianName,
    parentGuardianRelationship,
    parentPhone,
    childBenefited,
    academicImprovementNoticed,
    confidenceBehaviorChange,
    mostValuableAspects,
    parentSatisfactionRating,
    programImpactOnChild,
    parentImprovementSuggestions,
    additionalComments,
  } = req.body;

  try {
    const response = await submitFeedback({
    studentFirstName,
    studentSurname,
    schoolName,
    currentClass,
    attendanceFrequency,
    enjoyedParts,
    learningImprovementRating,
    confidenceRating,
    volunteerSupportRating,
    studentEnjoyedMost,
    studentImprovementSuggestions,
    parentGuardianName,
    parentGuardianRelationship,
    parentPhone,
    childBenefited,
    academicImprovementNoticed,
    confidenceBehaviorChange,
    mostValuableAspects,
    parentSatisfactionRating,
    programImpactOnChild,
    parentImprovementSuggestions,
    additionalComments,
  })

    return successResponse(res, response.code, response.message, response.data)
  } catch (error) {
    next(error);
  }
};
