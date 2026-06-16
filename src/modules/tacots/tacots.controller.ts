//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import { Parser } from "json2csv";
import {
  submitRecommendation,
  listRecommendations,
  getRecommendation,
  updateRecommendedStudentStatus,
  deleteRecommendation,
  exportTacotsRecommendationTableToCSV,
  submitTacotsFeedback,
  listTacotsFeedback,
  getTacotsFeedback,
  deleteTacotsFeedback,
  exportTacotsFeedbackTableToCSV,
  submitOnboarding,
  listOnboarding,
  getOnboarding,
  deleteOnboarding,
  exportTacotsOnboardingTableToCSV,
  submitTacotsTracking,
  listTacotsTracking,
  getTacotsTracking,
  deleteTacotsTracking,
  exportTacotsTrackingTableToCSV,
  submitTacotsExit,
  listTacotsExit,
  getTacotsExit,
  deleteTacotsExit,
  exportTacotsExitTableToCSV,
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
  const { page, limit, orderBy, search, status, sortBy } = req.qtransformed;
  try {
    const response = await listRecommendations(page, limit, orderBy, search, status, sortBy);
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
export const updateRecommendedStudentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  const { status } = req.qtransformed;

  try {
    const response = await updateRecommendedStudentStatus(id, status);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const deleteRecommendationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteRecommendation(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};
export const exportTacotsRecommendationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportTacotsRecommendationTableToCSV();

    const fields = [
      "id",
      "firstName",
      "middleName",
      "surname",
      "gender",
      "age",
      "dob",
      "religion",
      "catholicSacraments",
      "parishAttended",
      "diocese",
      "primaryLanguage",
      "phoneNumber",
      "nationality",
      "stateOfOrigin",
      "lga",
      "homeAddress",
      "schoolName",
      "schoolTown",
      "schoolState",
      "lastYearAttended",
      "lastClass",
      "classPositionLastTerm",
      "lastTermAverage",
      "passportPhotoUrl",
      "passportPhotoPublicId",
      "lastResultUrl",
      "lastResultPublicId",
      "fathersName",
      "fathersOccupation",
      "fathersPhone",
      "mothersName",
      "mothersOccupation",
      "mothersPhone",
      "parentsAddress",
      "guardianName",
      "guardianPhone",
      "guardianRelationship",
      "guardianOccupation",
      "guardianAddress",
      "householdSize",
      "numSiblings",
      "familyPosition",
      "specialCircumstances",
      "annualHouseholdIncome",
      "incomeSources",
      "numIncomeEarners",
      "avgMonthlyIncome",
      "livesWith",
      "residenceType",
      "hasElectricity",
      "recommenderFirstName",
      "recommenderLastName",
      "recommenderPhone",
      "recommenderAddress",
      "childBackgroundNotes",
      "supportTypesNeeded",
      "otherImportantInfo",
      "disciplineRating",
      "responsibilityRating",
      "careerGoal",
      "studentStatement",
      "declarationConfirmed",
      "adminStatus",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="tacots_recommendation.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
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
  const { page, limit, search } = req.qtransformed;
  try {
    const response = await listTacotsFeedback(page, limit, search);
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
export const deleteFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteTacotsFeedback(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};
export const exportTacotsFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportTacotsFeedbackTableToCSV();

    const fields = [
      "id",
      "studentFirstName",
      "studentSurname",
      "currentSchool",
      "currentClass",
      "scholarshipHelpedStay",
      "mostHelpfulSupport",
      "studyMotivationRating",
      "mentorshipImpactRating",
      "currentChallenges",
      "likedMost",
      "studentImprovementSuggestions",
      "parentGuardianName",
      "parentGuardianRelationship",
      "parentPhone",
      "scholarshipReducedBurden",
      "academicImprovementNoticed",
      "attitudeChangeNoticed",
      "parentSatisfactionRating",
      "programImpactOnFamily",
      "parentImprovementSuggestions",
      "additionalComments",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="tacots_feedback.csv"');

    return res.status(200).send(csv);
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
  const { page, limit, orderBy, search, sortBy } = req.qtransformed;
  try {
    const response = await listOnboarding(page, limit, orderBy, search, sortBy);
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
export const exportTacotsOnboardingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportTacotsOnboardingTableToCSV();

    const fields = [
      "id",
      "studentId",
      "onboardingDate",
      "hasMentalHealthDiagnosis",
      "diagnosedConditions",
      "behavioralIndicators",
      "focusAbilityRating",
      "emotionalStabilityRating",
      "peerInteractionRating",
      "receivedCounseling",
      "needsSpecialSupport",
      "mentalHealthNotes",
      "generalHealthStatus",
      "immunizationStatus",
      "hasChronicCondition",
      "chronicConditions",
      "allergies",
      "requiresMedication",
      "physicalActivityLevel",
      "physicalLimitations",
      "additionalHealthNotes",
      "enrolledSchoolName",
      "enrolledSchoolTown",
      "enrolledSchoolLga",
      "enrolledSchoolState",
      "enrolledClass",
      "termResumptionDate",
      "schoolFeesPerTerm",
      "studentCommitment",
      "parentGuardianCommitment",
      "parentSignatureUrl",
      "parentSignaturePublicId",
      "admissionLetterUrl",
      "admissionLetterPublicId",
      "programOfficerNotes",
      "supportTypesApproved",
      "mentorName",
      "sponsorName",
      "additionalInfo",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="tacots_onboarding.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
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

    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const listTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, orderBy ,search, sortBy } = req.qtransformed;
  try {
    const response = await listTacotsTracking(page, limit, orderBy, search, sortBy);
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
export const exportTacotsTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportTacotsTrackingTableToCSV();

    const fields = [
      "id",
      "studentId",
      "schoolId",
      "region",
      "academicSession",
      "academicTerm",
      "assessmentPeriod",
      "submissionDate",
      "highestSubjectScore",
      "lowestSubjectScore",
      "studentAveragePct",
      "studentPositionInClass",
      "termResultUrl",
      "termResultPublicId",
      "academicComment",
      "socialBehaviorRating",
      "schoolRulesRating",
      "responsibilityRating",
      "formationComments",
      "mentorName",
      "mentorshipSessionDate",
      "mentorshipMode",
      "mentorshipDuration",
      "mentorshipNotes",
      "serviceActivityType",
      "serviceDate",
      "serviceDuration",
      "serviceDescription",
      "serviceSupervisor",
      "tuitionFeePaid",
      "resourcesSpent",
      "sundriesSpent",
      "totalAmountSpent",
      "paymentEvidenceUrl",
      "paymentEvidencePublicId",
      "financialNotes",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="tacots_tracking.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
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
  const { page, limit, orderBy, search, sortBy } = req.qtransformed;
  try {
    const response = await listTacotsExit(page, limit, orderBy, search, sortBy);
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
export const exportTacotsExitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await exportTacotsExitTableToCSV();

    const fields = [
      "id",
      "studentId",
      "schoolAttendedDuringProgram",
      "yearOfExit",
      "exitReason",
      "highestEducationAttained",
      "currentStatus",
      "higherInstitutionName",
      "higherInstitutionCity",
      "higherInstitutionState",
      "employmentType",
      "vocationalSkill",
      "newSchoolName",
      "completedSecondaryElsewhere",
      "programImpactDescription",
      "programImpactRating",
      "additionalSituationInfo",
      "completedBy",
      "submissionDate",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", 'attachment; filename="tacots_exit.csv"');

    return res.status(200).send(Buffer.from(csv, "utf-8"));
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
