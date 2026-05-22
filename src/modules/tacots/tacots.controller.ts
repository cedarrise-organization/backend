//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import {
  submitRecommendation,
  listRecommendations,
  getRecommendation,
  submitFeedback,
  listFeedback,
  getFeedback,
} from "../../services/tacots.services.js";

export const submitRecommendationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    firstName,
    middleName,
    surname,
    gender,
    age,
    dob,
    religion,
    catholicSacraments,
    parishAttended,
    diocese,
    primaryLanguage,
    phoneNumber,
    nationality,
    stateOfOrigin,
    lga,
    homeAddress,
    schoolName,
    schoolTown,
    schoolState,
    lastYearAttended,
    lastClass,
    classPositionLastTerm,
    lastTermAverage,
    fathersName,
    fathersOccupation,
    fathersPhone,
    mothersName,
    mothersOccupation,
    mothersPhone,
    parentsAddress,
    guardianName,
    guardianPhone,
    guardianRelationship,
    guardianOccupation,
    guardianAddress,
    householdSize,
    numSiblings,
    familyPosition,
    specialCircumstances,
    annualHouseholdIncome,
    incomeSources,
    numIncomeEarners,
    avgMonthlyIncome,
    livesWith,
    residenceType,
    hasElectricity,
    recommenderFirstName,
    recommenderLastName,
    recommenderPhone,
    recommenderAddress,
    childBackgroundNotes,
    supportTypesNeeded,
    otherImportantInfo,
    disciplineRating,
    responsibilityRating,
    careerGoal,
    studentStatement,
    declarationConfirmed,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload the file");

  try {
    const response = await submitRecommendation(req, {
      firstName,
      middleName,
      surname,
      gender,
      age,
      dob,
      religion,
      catholicSacraments,
      parishAttended,
      diocese,
      primaryLanguage,
      phoneNumber,
      nationality,
      stateOfOrigin,
      lga,
      homeAddress,
      schoolName,
      schoolTown,
      schoolState,
      lastYearAttended,
      lastClass,
      classPositionLastTerm,
      lastTermAverage,
      fathersName,
      fathersOccupation,
      fathersPhone,
      mothersName,
      mothersOccupation,
      mothersPhone,
      parentsAddress,
      guardianName,
      guardianPhone,
      guardianRelationship,
      guardianOccupation,
      guardianAddress,
      householdSize,
      numSiblings,
      familyPosition,
      specialCircumstances,
      annualHouseholdIncome,
      incomeSources,
      numIncomeEarners,
      avgMonthlyIncome,
      livesWith,
      residenceType,
      hasElectricity,
      recommenderFirstName,
      recommenderLastName,
      recommenderPhone,
      recommenderAddress,
      childBackgroundNotes,
      supportTypesNeeded,
      otherImportantInfo,
      disciplineRating,
      responsibilityRating,
      careerGoal,
      studentStatement,
      declarationConfirmed,
    });

    return successResponse(res, response.code, response.message, response.data);
  } catch (err) {
    next(err);
  }
};

export const listRecommendationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, status, sortBy } = req.qtransformed;
  try {
    const response = await listRecommendations(page, limit, status, sortBy);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const getRecommendationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getRecommendation(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const submitFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const {
    studentFirstName,
    studentSurname,
    currentSchool,
    currentClass,
    scholarshipHelpedStay,
    mostHelpfulSupport,
    studyMotivationRating,
    mentorshipImpactRating,
    currentChallenges,
    likedMost,
    studentImprovementSuggestions,
    parentGuardianName,
    parentGuardianRelationship,
    parentPhone,
    scholarshipReducedBurden,
    academicImprovementNoticed,
    attitudeChangeNoticed,
    parentSatisfactionRating,
    programImpactOnFamily,
    parentImprovementSuggestions,
    additionalComments,
  } = req.body;
  try {
    const response = await submitFeedback({
      studentFirstName,
      studentSurname,
      currentSchool,
      currentClass,
      scholarshipHelpedStay,
      mostHelpfulSupport,
      studyMotivationRating,
      mentorshipImpactRating,
      currentChallenges,
      likedMost,
      studentImprovementSuggestions,
      parentGuardianName,
      parentGuardianRelationship,
      parentPhone,
      scholarshipReducedBurden,
      academicImprovementNoticed,
      attitudeChangeNoticed,
      parentSatisfactionRating,
      programImpactOnFamily,
      parentImprovementSuggestions,
      additionalComments,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listFeedback(page, limit);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getFeedback(id);
    return successResponse(res, response.code, response.message, response.data);
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
