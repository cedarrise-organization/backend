import { uploadToCloudinary, deleteFromCloudinary } from "../utils/storage.util.js";
import { addAssetToDeletionQueue } from "../queues/deleteCloudinaryAsset.queue.js";
import { CACHE_TTL, cacheSet, cacheGet, cacheDel } from "../lib/cache.js";
import { UploadApiResponse } from "cloudinary";
import { appEvents } from "../lib/events.js";
import { sql, asc, eq } from "drizzle-orm";
import { Request } from "express";
import {
  AshstudentbodyType,
  AshprogramfeedbackType,
  AshtermlytrackingbodyType,
  AshweeklyattendancebodyType,
  AshexitbodyType,
} from "../modules/ash/ash.schema.js";
import {
  ashStudent,
  ashProgramFeedback,
  ashTermlyTracking,
  ashWeeklyAttendance,
  ashExit,
} from "../db/models/admin.js";
import db from "../db/db.js";
import logger from "../configs/logger.config.js";

const sortMap = {
  firstName: ashStudent.firstName,
  surname: ashStudent.surname,
  gender: ashStudent.gender,
  schoolState: ashStudent.schoolState,
  currentClass: ashStudent.currentClass,
  assignedMentor: ashStudent.assignedMentor,
  createdAt: ashStudent.createdAt,
} as const;

// ASH REGISTRATION
export const submitRegistration = async (req: Request, options: AshstudentbodyType) => {
  const files = req.files as {
    passportPhoto: Express.Multer.File[];
    lastResult?: Express.Multer.File[];
    parentSignature: Express.Multer.File[];
  };

  const passportFile = files.passportPhoto?.[0];
  const resultFile = files.lastResult?.[0];
  const signatureFile = files.parentSignature?.[0];

  const passportUpload: UploadApiResponse | undefined | null = passportFile
    ? await uploadToCloudinary(passportFile, "/Cedarrise Initiative/ASH-ASSETS/PASSPORTS")
    : null;

  const resultUpload: UploadApiResponse | undefined | null = resultFile
    ? await uploadToCloudinary(resultFile, "/Cedarrise Initiative/ASH-ASSETS/RESULTS")
    : null;

  const signatureUpload: UploadApiResponse | undefined | null = signatureFile
    ? await uploadToCloudinary(signatureFile, "/Cedarrise Initiative/ASH-ASSETS/SIGNATURES")
    : null;

  if (!passportUpload || !signatureUpload) {
    throw new Error(`Could not upload passport or signature`);
  }

  const [newAshStudent] = await db
    .insert(ashStudent)
    .values({
      id: sql`uuid_generate_v4()`,
      programType: options.programType,
      firstName: options.firstName,
      middleName: options.middleName,
      surname: options.surname,
      gender: options.gender,
      age: options.age,
      dob: sql`TO_DATE(${options.dob}, 'YYYY-MM-DD')`,
      primaryLanguage: options.primaryLanguage,
      homeAddress: options.homeAddress,
      studentPhone: options.studentPhone,
      passportPhotoUrl: passportUpload ? passportUpload.secure_url : "",
      passportPhotoPublicId: passportUpload ? passportUpload.public_id : "",
      schoolName: options.schoolName,
      schoolTown: options.schoolTown,
      schoolLga: options.schoolLga,
      schoolState: options.schoolState,
      currentClass: options.currentClass,
      classPositionLastTerm: options.classPositionLastTerm,
      lastResultUrl: resultUpload ? resultUpload.secure_url : null,
      lastResultPublicId: resultUpload ? resultUpload.public_id : null,
      prevAfterschoolProgram: options.prevAfterschoolProgram,
      reasonForJoining: options.reasonForJoining,
      fathersName: options.fathersName,
      fathersPhone: options.fathersPhone,
      fathersOccupation: options.fathersOccupation,
      mothersName: options.mothersName,
      mothersPhone: options.mothersPhone,
      mothersOccupation: options.mothersOccupation,
      guardianName: options.guardianName,
      guardianRelationship: options.guardianRelationship,
      guardianPhone: options.guardianPhone,
      guardianOccupation: options.guardianOccupation,
      householdIncomeRange: options.householdIncomeRange,
      hasLearningCondition: options.hasLearningCondition,
      learningConditions: options.learningConditions,
      parentConsent: options.parentConsent,
      declarationConfirmed: options.declarationConfirmed,
      parentSignatureUrl: signatureUpload ? signatureUpload.secure_url : "",
      parentSignaturePublicId: signatureUpload ? signatureUpload.public_id : "",
      assignedMentor: options.assignedMentor,
      pretestScore: options.pretestScore,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:ash:ashStudent:${newAshStudent?.id}`,
    newAshStudent,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Ash registeration form submitted successfully",
    data: newAshStudent,
  };
};

export const listRegistrations = async (
  page: number,
  limit: number,
  status: string,
  sortBy: keyof typeof sortMap,
) => {
  /// cache
  const key = `cedarrise:ash:ashStudents:${page}:${limit}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Ash students found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const sortColumn = sortMap[sortBy] ?? ashStudent.createdAt;

  const ashStudents = await db
    .select()
    .from(ashStudent)
    .orderBy(
      sql`
        CASE
          WHEN ${ashStudent.status} = ${status} THEN 0
          ELSE 1
        END
      `,
      asc(sortColumn),
    )
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, ashStudents, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Ash students found successfully",
    data: ashStudents,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getRegistration = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:ashStudent:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Ash student found successfully",
      data: cacheRes,
    };
  }
  ///

  const [ashstudent] = await db.select().from(ashStudent).where(eq(ashStudent.id, id));

  /// cache set
  await cacheSet(key, ashstudent, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Ash student found successfully",
    data: ashstudent,
  };
};

export const deleteRegistration = async (id: string) => {
  const [data] = await db
    .select({
      passportPhotoPublicId: ashStudent.passportPhotoPublicId,
      lastResultPublicId: ashStudent.lastResultPublicId,
      parentSignaturePublicId: ashStudent.parentSignaturePublicId,
    })
    .from(ashStudent)
    .where(eq(ashStudent.id, id));

  if (data?.passportPhotoPublicId) {
    try {
      await addAssetToDeletionQueue(data.passportPhotoPublicId, "image", id);
    } catch (error) {
      logger.error(`Could not add passport photo public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.parentSignaturePublicId) {
    try {
      await addAssetToDeletionQueue(data.parentSignaturePublicId, "image", id);
    } catch (error) {
      logger.error(`Could not add parent signature public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.lastResultPublicId) {
    try {
      await addAssetToDeletionQueue(data.lastResultPublicId, "image", id);
    } catch (error) {
      logger.error(`Could not add last result public id to queue`, {
        user: id,
      });
    }
  }

  await db.delete(ashStudent).where(eq(ashStudent.id, id));

  /// cache delete
  await cacheDel(`cedarrise:ash:ashStudent:${id}`);
  ///
  return {
    code: 200,
    message: "Ash student data deleted successfully",
  };
};

// ASH FEEDBACK
export const submitFeedback = async (options: AshprogramfeedbackType) => {
  const [newAshProgramFeedback] = await db
    .insert(ashProgramFeedback)
    .values({
      id: sql`uuid_generate_v4()`,
      studentFirstName: options.studentFirstName,
      studentSurname: options.studentSurname,
      schoolName: options.schoolName,
      currentClass: options.currentClass,
      attendanceFrequency: options.attendanceFrequency,
      enjoyedParts: options.enjoyedParts,
      learningImprovementRating: options.learningImprovementRating,
      confidenceRating: options.confidenceRating,
      volunteerSupportRating: options.volunteerSupportRating,
      studentEnjoyedMost: options.studentEnjoyedMost,
      studentImprovementSuggestions: options.studentImprovementSuggestions,
      parentGuardianName: options.parentGuardianName,
      parentGuardianRelationship: options.parentGuardianRelationship,
      parentPhone: options.parentPhone,
      childBenefited: options.childBenefited,
      academicImprovementNoticed: options.academicImprovementNoticed,
      confidenceBehaviorChange: options.confidenceBehaviorChange,
      mostValuableAspects: options.mostValuableAspects,
      parentSatisfactionRating: options.parentSatisfactionRating,
      programImpactOnChild: options.programImpactOnChild,
      parentImprovementSuggestions: options.parentImprovementSuggestions,
      additionalComments: options.additionalComments,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:ash:feedback:${newAshProgramFeedback?.id}`,
    newAshProgramFeedback,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Ash Program feedback form submitted successfully",
    data: newAshProgramFeedback,
  };
};

export const listFeedback = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:ash:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Ash program feedback found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const allProgramFeedback = await db
    .select()
    .from(ashProgramFeedback)
    .orderBy(ashProgramFeedback.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, allProgramFeedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Ash program feedback found successfully",
    data: allProgramFeedback,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getFeedback = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:feedback:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Single Feeback found successfully",
      data: cacheRes,
    };
  }
  ///

  const [feedback] = await db
    .select()
    .from(ashProgramFeedback)
    .where(eq(ashProgramFeedback.id, id));

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Single Feeback found successfully",
    data: feedback,
  };
};

export const deleteFeedback = async (id: string) => {
  await db.delete(ashProgramFeedback).where(eq(ashProgramFeedback.id, id));

  /// cache delete
  await cacheDel(`cedarrise:ash:feedback:${id}`);
  ///

  return {
    code: 200,
    message: "Ash feedback data deleted successfully",
  };
};

// ASH TRACKING
export const submitTracking = async (req: Request, options: AshtermlytrackingbodyType) => {
  const termResultUpload: UploadApiResponse | undefined = await uploadToCloudinary(
    (req as any).file,
    "/Cedarrise Initiative/ASH-ASSETS/TERMLY-RESULTS",
  );

  if (!termResultUpload) {
    throw new Error(`Could not upload result`);
  }

  const [tracker] = await db
    .insert(ashTermlyTracking)
    .values({
      id: sql`uuid_generate_v4()`,
      studentId: options.studentId,
      academicSession: options.academicSession,
      term: options.term,
      schoolName: options.schoolName,
      schoolNumeracyScore: options.schoolNumeracyScore,
      schoolLiteracyScore: options.schoolLiteracyScore,
      schoolAverage: options.schoolAverage,
      schoolPosition: options.schoolPosition,
      pretestNumeracyScore: options.pretestNumeracyScore,
      pretestLiteracyScore: options.pretestLiteracyScore,
      pretestAverage: options.pretestAverage,
      midtestNumeracyScore: options.midtestNumeracyScore,
      midtestLiteracyScore: options.midtestLiteracyScore,
      midtestAverage: options.midtestAverage,
      posttestNumeracyScore: options.posttestNumeracyScore,
      posttestLiteracyScore: options.posttestLiteracyScore,
      posttestAverage: options.posttestAverage,
      disciplineRating: options.disciplineRating,
      responsibilityRating: options.responsibilityRating,
      leadershipRating: options.leadershipRating,
      notableAchievements: options.notableAchievements,
      challengesObserved: options.challengesObserved,
      nextTermRecommendations: options.nextTermRecommendations,
      mentorName: options.mentorName,
      termResultUrl: termResultUpload ? termResultUpload.secure_url : "",
      termResultPublicId: termResultUpload ? termResultUpload.public_id : "",
    })
    .returning();

  /// cache set
  await cacheSet(`cedarrise:ash:termlytracking:${tracker?.id}`, tracker, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 201,
    message: "Tracker form submitted successfully",
    data: tracker,
  };
};

export const listTracking = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:ash:termlytracking:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tracking data found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const tracking = await db
    .select()
    .from(ashTermlyTracking)
    .orderBy(ashTermlyTracking.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, tracking, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tracking  data found successfully",
    data: tracking,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getTrack = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:termlytracking:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Track data found successfully",
      data: cacheRes,
    };
  }
  ///

  const [track] = await db.select().from(ashTermlyTracking).where(eq(ashTermlyTracking.id, id));

  /// cache set
  await cacheSet(key, track, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Track data found successfully",
    data: track,
  };
};

export const deleteTrack = async (id: string) => {
  const [data] = await db
    .select({
      termResultPublicId: ashTermlyTracking.termResultPublicId,
    })
    .from(ashTermlyTracking)
    .where(eq(ashTermlyTracking.id, id));

  if (data?.termResultPublicId) {
    try {
      await addAssetToDeletionQueue(data.termResultPublicId, "image", id);
    } catch (error) {
      logger.error(`Could not add term result public id to queue`, {
        user: id,
      });
    }
  }

  // delete file from db
  await db.delete(ashTermlyTracking).where(eq(ashTermlyTracking.id, id));

  /// cache delete
  await cacheDel(`cedarrise:ash:termlytracking:${id}`);
  ///

  return {
    code: 200,
    message: "Ash tracking data deleted successfully",
  };
};

// ASH ATTENDANCE
export const submitAttendance = async (options: AshweeklyattendancebodyType) => {
  const [attendance] = await db
    .insert(ashWeeklyAttendance)
    .values({
      id: sql`uuid_generate_v4()`,
      sessionDate: sql`TO_DATE(${options.sessionDate}, 'YYYY-MM-DD')`,
      studentsInAttendance: options.studentsInAttendance,
      studentsMentored: options.studentsMentored,
      sessionsConducted: options.sessionsConducted,
      sessionDetails: options.sessionDetails,
      volunteersInAttendance: options.volunteersInAttendance,
      programReview: options.programReview,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:ash:weeklyattendance:${attendance?.id}`,
    attendance,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Attendance form submitted successfully",
    data: attendance,
  };
};

export const listAttendance = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:ash:weeklyattendance:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Attendance data found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const attendance = await db
    .select()
    .from(ashWeeklyAttendance)
    .orderBy(ashWeeklyAttendance.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, attendance, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Attendance data found successfully",
    data: attendance,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getAttendance = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:weeklyattendance:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Attendance found successfully",
      data: cacheRes,
    };
  }
  ///

  const [attendance] = await db
    .select()
    .from(ashWeeklyAttendance)
    .where(eq(ashWeeklyAttendance.id, id));

  /// cache set
  await cacheSet(key, attendance, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Attendance found successfully",
    data: attendance,
  };
};

export const deleteAttendance = async (id: string) => {
  await db.delete(ashWeeklyAttendance).where(eq(ashWeeklyAttendance.id, id));

  /// cache delete
  await cacheDel(`cedarrise:ash:weeklyattendance:${id}`);
  ///

  return {
    code: 200,
    message: "Ash attendance data deleted successfully",
  };
};

// ASH EXIT
export const submitExit = async (options: AshexitbodyType) => {
  const [exit] = await db
    .insert(ashExit)
    .values({
      id: sql`uuid_generate_v4()`,
      studentId: options.studentId,
      ageAtExit: options.ageAtExit,
      schoolName: options.schoolName,
      classAtExit: options.classAtExit,
      durationInProgram: options.durationInProgram,
      exitReason: options.exitReason,
      academicImpactRating: options.academicImpactRating,
      areasOfImprovement: options.areasOfImprovement,
      mentorshipReceived: options.mentorshipReceived,
      mentorshipImpactRating: options.mentorshipImpactRating,
      postAshStatus: options.postAshStatus,
      institutionName: options.institutionName,
      courseOfStudy: options.courseOfStudy,
      vocationalSkill: options.vocationalSkill,
      enjoyedMost: options.enjoyedMost,
      programImpact: options.programImpact,
      improvementSuggestions: options.improvementSuggestions,
      facilitatorName: options.facilitatorName,
      exitDate: sql`TO_DATE(${options.exitDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  /// cache set
  await cacheSet(`cedarrise:ash:exit:${exit?.id}`, exit, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 201,
    message: "Exit form submitted successfully",
    data: exit,
  };
};

export const listExit = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:ash:exit:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Exit data found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const exit = await db
    .select()
    .from(ashExit)
    .orderBy(ashExit.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, exit, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Exit data found successfully",
    data: exit,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getExit = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:exit:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Exit found successfully",
      data: cacheRes,
    };
  }
  ///

  const [exit] = await db.select().from(ashExit).where(eq(ashExit.id, id));

  /// cache set
  await cacheSet(key, exit, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "exit found successfully",
    data: exit,
  };
};

export const deleteExit = async (id: string) => {
  await db.delete(ashExit).where(eq(ashExit.id, id));

  /// cache delete
  await cacheDel(`cedarrise:ash:exit:${id}`);
  ///

  return {
    code: 200,
    message: "Ash exit data deleted successfully",
  };
};
