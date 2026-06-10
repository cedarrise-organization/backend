//CONTROLLER
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";
import { successResponse } from "../../utils/responseHandler.js";
import { ValidationError } from "../../lib/error.js";
import {
  submitRegistration,
  listRegistrations,
  getRegistration,
  updateAshStudentStatus,
  assignAshMentor,
  exportAshStudentTableToCSV,
  deleteRegistration,
  submitFeedback,
  listFeedback,
  getFeedback,
  deleteFeedback,
  exportAshFeedbackTableToCSV,
  submitTracking,
  listTracking,
  getTrack,
  deleteTrack,
  exportAshTermlyTrackingTableToCSV,
  submitAttendance,
  listAttendance,
  getAttendance,
  deleteAttendance,
  exportAshAttendanceTableToCSV,
  submitExit,
  listExit,
  getExit,
  deleteExit,
  exportAshExitTableToCSV,
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
  const id = (req as any).params.id.toString();
  const { mentor } = req.body;
  try {
    const response = await assignAshMentor(id, mentor);
    return successResponse(res, response.code, response.message, response.data);
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
export const exportAshStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportAshStudentTableToCSV();

    const fields = [
      "id",
      "programType",
      "firstName",
      "middleName",
      "surname",
      "gender",
      "age",
      "dob",
      "primaryLanguage",
      "homeAddress",
      "studentPhone",
      "passportPhotoUrl",
      "passportPhotoPublicId",
      "schoolName",
      "schoolTown",
      "schoolLga",
      "schoolState",
      "currentClass",
      "classPositionLastTerm",
      "lastResultUrl",
      "lastResultPublicId",
      "prevAfterschoolProgram",
      "reasonForJoining",
      "fathersName",
      "fathersPhone",
      "fathersOccupation",
      "mothersName",
      "mothersPhone",
      "mothersOccupation",
      "guardianName",
      "guardianRelationship",
      "guardianPhone",
      "guardianOccupation",
      "householdIncomeRange",
      "hasLearningCondition",
      "learningConditions",
      "parentConsent",
      "declarationConfirmed",
      "parentSignatureUrl",
      "parentSignaturePublicId",
      "assignedMentor",
      "pretestScore",
      "status",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="ash_students.csv"');

    return res.status(200).send(csv);
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
export const exportAshFeedbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportAshFeedbackTableToCSV();

    const fields = [
      "id",
      "studentFirstName",
      "studentSurname",
      "schoolName",
      "currentClass",
      "attendanceFrequency",
      "enjoyedParts",
      "learningImprovementRating",
      "confidenceRating",
      "volunteerSupportRating",
      "studentEnjoyedMost",
      "studentImprovementSuggestions",
      "parentGuardianName",
      "parentGuardianRelationship",
      "parentPhone",
      "childBenefited",
      "academicImprovementNoticed",
      "confidenceBehaviorChange",
      "mostValuableAspects",
      "parentSatisfactionRating",
      "programImpactOnChild",
      "parentImprovementSuggestions",
      "additionalComments",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="ash_program_feedback.csv"');

    return res.status(200).send(csv);
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
export const exportAshTermlyTrackingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportAshTermlyTrackingTableToCSV();

    const fields = [
      "id",
      "studentId",
      "academicSession",
      "term",
      "schoolName",
      "schoolNumeracyScore",
      "schoolLiteracyScore",
      "schoolAverage",
      "schoolPosition",
      "pretestNumeracyScore",
      "pretestLiteracyScore",
      "pretestAverage",
      "midtestNumeracyScore",
      "midtestLiteracyScore",
      "midtestAverage",
      "posttestNumeracyScore",
      "posttestLiteracyScore",
      "posttestAverage",
      "termResultUrl",
      "termResultPublicId",
      "disciplineRating",
      "responsibilityRating",
      "leadershipRating",
      "notableAchievements",
      "challengesObserved",
      "nextTermRecommendations",
      "mentorName",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="ash_termly_tracking.csv"');

    return res.status(200).send(csv);
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
export const exportAshAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await exportAshAttendanceTableToCSV();

    const fields = [
      "id",
      "sessionDate",
      "studentsInAttendance",
      "studentsMentored",
      "sessionsConducted",
      "sessionDetails",
      "volunteersInAttendance",
      "programReview",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="ash_weekly_attendance.csv"');

    return res.status(200).send(csv);
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
export const exportAshExitController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await exportAshExitTableToCSV();

    const fields = [
      "id",
      "studentId",
      "ageAtExit",
      "schoolName",
      "classAtExit",
      "durationInProgram",
      "exitReason",
      "academicImpactRating",
      "areasOfImprovement",
      "mentorshipReceived",
      "mentorshipImpactRating",
      "postAshStatus",
      "institutionName",
      "courseOfStudy",
      "vocationalSkill",
      "enjoyedMost",
      "programImpact",
      "improvementSuggestions",
      "facilitatorName",
      "exitDate",
      "updatedAt",
      "createdAt",
      "deletedAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(response);

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", 'attachment; filename="ash_exit.csv"');

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
