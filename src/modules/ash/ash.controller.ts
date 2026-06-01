//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import {
  submitRegistration,
  listRegistrations,
  getRegistration,
  updateAshStudentStatus,
  assignAshMentor,
  deleteRegistration,
  submitFeedback,
  listFeedback,
  getFeedback,
  deleteFeedback,
  submitTracking,
  listTracking,
  getTrack,
  deleteTrack,
  submitAttendance,
  listAttendance,
  getAttendance,
  deleteAttendance,
  submitExit,
  listExit,
  getExit,
  deleteExit,
} from "../../services/ash.services.js";

// ASH REGISTRATION
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

export const listRegistrationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page, limit, status, sortBy } = req.qtransformed;
  try {
    const response = await listRegistrations(page, limit, status, sortBy);
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
    const response = await getRegistration(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const updateAshStudentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  const { status } = req.qtransformed;
  try {
    const response = await updateAshStudentStatus(id, status);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};
export const assignAshMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const response = await example();
    // return successResponse(res, response.code, response.message, response.data)
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
    const response = await deleteRegistration(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// ASH FEEDBACK
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
    return successResponse(res, response.code, response.message, response.data, response.meta);
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

export const deleteFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteFeedback(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// ASH TRACKING
export const submitTrackingController = async (req: Request, res: Response, next: NextFunction) => {
  const {
    studentId,
    academicSession,
    term,
    schoolName,
    schoolNumeracyScore,
    schoolLiteracyScore,
    schoolAverage,
    schoolPosition,
    pretestNumeracyScore,
    pretestLiteracyScore,
    pretestAverage,
    midtestNumeracyScore,
    midtestLiteracyScore,
    midtestAverage,
    posttestNumeracyScore,
    posttestLiteracyScore,
    posttestAverage,
    disciplineRating,
    responsibilityRating,
    leadershipRating,
    notableAchievements,
    challengesObserved,
    nextTermRecommendations,
    mentorName,
  } = req.body;

  if (!req.file) throw new ValidationError("Please upload the relevant file");

  try {
    const response = await submitTracking(req, {
      studentId,
      academicSession,
      term,
      schoolName,
      schoolNumeracyScore,
      schoolLiteracyScore,
      schoolAverage,
      schoolPosition,
      pretestNumeracyScore,
      pretestLiteracyScore,
      pretestAverage,
      midtestNumeracyScore,
      midtestLiteracyScore,
      midtestAverage,
      posttestNumeracyScore,
      posttestLiteracyScore,
      posttestAverage,
      disciplineRating,
      responsibilityRating,
      leadershipRating,
      notableAchievements,
      challengesObserved,
      nextTermRecommendations,
      mentorName,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listTrackingController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listTracking(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getTrackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getTrack(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteTrackController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteTrack(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// ASH ATTENDANCE
export const submitAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    sessionDate,
    studentsInAttendance,
    studentsMentored,
    sessionsConducted,
    sessionDetails,
    volunteersInAttendance,
    programReview,
  } = req.body;
  try {
    const response = await submitAttendance({
      sessionDate,
      studentsInAttendance,
      studentsMentored,
      sessionsConducted,
      sessionDetails,
      volunteersInAttendance,
      programReview,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listAttendanceController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listAttendance(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getAttendance(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteAttendance(id);
    return successResponse(res, response.code, response.message);
  } catch (error) {
    next(error);
  }
};

// ASH EXIT
export const submitExitController = async (req: Request, res: Response, next: NextFunction) => {
  const {
    studentId,
    ageAtExit,
    schoolName,
    classAtExit,
    durationInProgram,
    exitReason,
    academicImpactRating,
    areasOfImprovement,
    mentorshipReceived,
    mentorshipImpactRating,
    postAshStatus,
    institutionName,
    courseOfStudy,
    vocationalSkill,
    enjoyedMost,
    programImpact,
    improvementSuggestions,
    facilitatorName,
    exitDate,
  } = req.body;
  try {
    const response = await submitExit({
      studentId,
      ageAtExit,
      schoolName,
      classAtExit,
      durationInProgram,
      exitReason,
      academicImpactRating,
      areasOfImprovement,
      mentorshipReceived,
      mentorshipImpactRating,
      postAshStatus,
      institutionName,
      courseOfStudy,
      vocationalSkill,
      enjoyedMost,
      programImpact,
      improvementSuggestions,
      facilitatorName,
      exitDate,
    });
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const listExitController = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.qtransformed;
  try {
    const response = await listExit(page, limit);
    return successResponse(res, response.code, response.message, response.data, response.meta);
  } catch (error) {
    next(error);
  }
};

export const getExitController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await getExit(id);
    return successResponse(res, response.code, response.message, response.data);
  } catch (error) {
    next(error);
  }
};

export const deleteExitController = async (req: Request, res: Response, next: NextFunction) => {
  const id = (req as any).params.id.toString();
  try {
    const response = await deleteExit(id);
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
