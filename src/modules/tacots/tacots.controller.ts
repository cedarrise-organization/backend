//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import {
  submitRecommendation,
  listRecommendations,
  getRecommendation,
  submitTacotsFeedback,
  listTacotsFeedback,
  getTacotsFeedback,
  submitOnboarding,
  listOnboarding,
  getOnboarding,
  deleteOnboarding,
  submitTacotsTracking,
  listTacotsTracking,
  getTacotsTracking,
  deleteTacotsTracking,
  submitTacotsExit,
  listTacotsExit,
  getTacotsExit,
  deleteTacotsExit,
} from "../../services/tacots.services.js";

// RECOMMENDATION
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
    return successResponse(res, response.code, response.message, response.data, response.meta);
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

// FEEDBACK
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
    const response = await submitTacotsFeedback({
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
    const response = await listTacotsFeedback(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getTacotsFeedback(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

// ONBOARDING
export const submitOnboardingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    studentId,
    onboardingDate,
    hasMentalHealthDiagnosis,
    diagnosedConditions,
    behavioralIndicators,
    focusAbilityRating,
    emotionalStabilityRating,
    peerInteractionRating,
    receivedCounseling,
    needsSpecialSupport,
    mentalHealthNotes,
    generalHealthStatus,
    immunizationStatus,
    hasChronicCondition,
    chronicConditions,
    allergies,
    requiresMedication,
    physicalActivityLevel,
    physicalLimitations,
    additionalHealthNotes,
    enrolledSchoolName,
    enrolledSchoolTown,
    enrolledSchoolLga,
    enrolledSchoolState,
    enrolledClass,
    termResumptionDate,
    schoolFeesPerTerm,
    studentCommitment,
    parentGuardianCommitment,
    programOfficerNotes,
    supportTypesApproved,
    mentorName,
    sponsorName,
    additionalInfo,
  } = req.body;
  try {
    const response = await submitOnboarding(req, {
      studentId,
      onboardingDate,
      hasMentalHealthDiagnosis,
      diagnosedConditions,
      behavioralIndicators,
      focusAbilityRating,
      emotionalStabilityRating,
      peerInteractionRating,
      receivedCounseling,
      needsSpecialSupport,
      mentalHealthNotes,
      generalHealthStatus,
      immunizationStatus,
      hasChronicCondition,
      chronicConditions,
      allergies,
      requiresMedication,
      physicalActivityLevel,
      physicalLimitations,
      additionalHealthNotes,
      enrolledSchoolName,
      enrolledSchoolTown,
      enrolledSchoolLga,
      enrolledSchoolState,
      enrolledClass,
      termResumptionDate,
      schoolFeesPerTerm,
      studentCommitment,
      parentGuardianCommitment,
      programOfficerNotes,
      supportTypesApproved,
      mentorName,
      sponsorName,
      additionalInfo,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listOnboardingController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listOnboarding(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getOnboardingController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getOnboarding(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteOnboardingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteOnboarding(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// TRACKING
export const submitTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    studentId,
    schoolId,
    region,
    academicSession,
    academicTerm,
    assessmentPeriod,
    submissionDate,
    highestSubjectScore,
    lowestSubjectScore,
    studentAveragePct,
    studentPositionInClass,
    academicComment,
    socialBehaviorRating,
    schoolRulesRating,
    responsibilityRating,
    formationComments,
    mentorName,
    mentorshipSessionDate,
    mentorshipMode,
    mentorshipDuration,
    mentorshipNotes,
    serviceActivityType,
    serviceDate,
    serviceDuration,
    serviceDescription,
    serviceSupervisor,
    tuitionFeePaid,
    resourcesSpent,
    sundriesSpent,
    totalAmountSpent,
    financialNotes,
  } = req.body;

  if (!req.files) throw new ValidationError("Please upload the file");
  try {
    const response = await submitTacotsTracking(req, {
      studentId,
      schoolId,
      region,
      academicSession,
      academicTerm,
      assessmentPeriod,
      submissionDate,
      highestSubjectScore,
      lowestSubjectScore,
      studentAveragePct,
      studentPositionInClass,
      academicComment,
      socialBehaviorRating,
      schoolRulesRating,
      responsibilityRating,
      formationComments,
      mentorName,
      mentorshipSessionDate,
      mentorshipMode,
      mentorshipDuration,
      mentorshipNotes,
      serviceActivityType,
      serviceDate,
      serviceDuration,
      serviceDescription,
      serviceSupervisor,
      tuitionFeePaid,
      resourcesSpent,
      sundriesSpent,
      totalAmountSpent,
      financialNotes,
    });

    return successResponse(res, response.code, response.message, response.data)
  } catch (error) {
    next(error);
  }
};

export const listTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listTacotsTracking(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getTacotsTracking(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteTacotsTracking(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// EXIT
export const submitTacotsExitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    studentId,
    schoolAttendedDuringProgram,
    yearOfExit,
    exitReason,
    highestEducationAttained,
    currentStatus,
    higherInstitutionName,
    higherInstitutionCity,
    higherInstitutionState,
    employmentType,
    vocationalSkill,
    newSchoolName,
    completedSecondaryElsewhere,
    programImpactDescription,
    programImpactRating,
    additionalSituationInfo,
    completedBy,
    submissionDate,
  } = req.body;
  try {
    const response = await submitTacotsExit({
      studentId,
      schoolAttendedDuringProgram,
      yearOfExit,
      exitReason,
      highestEducationAttained,
      currentStatus,
      higherInstitutionName,
      higherInstitutionCity,
      higherInstitutionState,
      employmentType,
      vocationalSkill,
      newSchoolName,
      completedSecondaryElsewhere,
      programImpactDescription,
      programImpactRating,
      additionalSituationInfo,
      completedBy,
      submissionDate,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listTacotsExitController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listTacotsExit(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getTacotsExitController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getTacotsExit(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteTacotsExitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteTacotsExit(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// EXAMPLE
export const example = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const response = await example();
    // return successResponse(res, response.code, response.message, response.data)
  } catch (error) {
    next(error);
  }
};
