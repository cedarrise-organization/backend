import { uploadToCloudinary } from "../utils/storage.util.js";
import { addAssetToDeletionQueue } from "../queues/deleteCloudinaryAsset.queue.js";
import { CACHE_TTL, cacheSet, cacheGet } from "../lib/cache.js";
import { ASH_EVENTS } from "../events/ash.events.js";
import { UploadApiResponse } from "cloudinary";
import { appEvents } from "../lib/events.js";
import {
  sql,
  asc,
  and,
  eq,
  lt,
  count,
  countDistinct,
  desc,
  inArray,
  getTableColumns,
} from "drizzle-orm";
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
  tacotsRecommendation,
  tacotsOnboarding,
} from "../db/models/admin.js";
import db from "../db/db.js";
import logger from "../configs/logger.config.js";
import { NotFoundError } from "../lib/error.js";

const sortMap = {
  // ashStudent
  firstName: ashStudent.firstName,
  surname: ashStudent.surname,
  gender: ashStudent.gender,
  schoolState: ashStudent.schoolState,
  currentClass: ashStudent.currentClass,
  assignedMentor: ashStudent.assignedMentor,
  createdAt: ashStudent.createdAt,
} as const;
const termlySortMap = {
  // ashTermlyTracking
  academicSession: ashTermlyTracking.academicSession,
  term: ashTermlyTracking.term,
  schoolName: ashTermlyTracking.schoolName,
  mentorName: ashTermlyTracking.mentorName,
  createdAt: ashTermlyTracking.createdAt,
} as const;
const exitSortMap = {
  // ashExit
  ageAtExit: ashExit.ageAtExit,
  schoolName: ashExit.schoolName,
  classAtExit: ashExit.classAtExit,
  durationInProgram: ashExit.durationInProgram,
  facilitatorName: ashExit.facilitatorName,
  exitDate: ashExit.exitDate,
  createdAt: ashExit.createdAt,
} as const;

// ASH REGISTRATION
export const submitRegistration = async (
  req: Request,
  options: AshstudentbodyType,
  correlationId: string,
) => {
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

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:ashStudents:*`,
    event: "ASH REGISRATION FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Ash registration form submitted successfully",
    data: newAshStudent,
    meta: {
      correlationId,
    },
  };
};
export const listRegistrations = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  status: string,
  sortBy: keyof typeof sortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
    setweight(to_tsvector('english', ${ashStudent.firstName}), 'A') ||
    setweight(to_tsvector('english', ${ashStudent.surname}), 'A') ||
    setweight(to_tsvector('english', coalesce(${ashStudent.middleName}, '')), 'A') ||
    setweight(to_tsvector('english', ${ashStudent.currentClass}), 'B') ||
    setweight(to_tsvector('english', coalesce(${ashStudent.assignedMentor}, '')), 'B') ||
    setweight(to_tsvector('english', ${ashStudent.schoolName}), 'B') ||
    setweight(to_tsvector('english', ${ashStudent.schoolState}), 'C') ||
    setweight(to_tsvector('english', ${ashStudent.schoolTown}), 'C') ||
    setweight(to_tsvector('english', ${ashStudent.schoolLga}), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(${ashStudent.learningConditions}, ' '), '')), 'C')
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [ashStudents, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(ashStudent)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(ashStudent.id) })
        .from(ashStudent)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Ash students found successfully",
      data: ashStudents,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:ash:ashStudents:${page}:${limit}:${orderBy}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Ash students found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        metadata: cacheRes.metadata,
        correlationId,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? ashStudent.createdAt;
  const orderby =
    sortColumn === ashStudent.createdAt
      ? [
          sql`
          CASE
            WHEN ${ashStudent.status} = ${status} THEN 0
            ELSE 1
          END
        `,
          desc(ashStudent.createdAt),
        ]
      : [
          sql`
          CASE
            WHEN ${ashStudent.status} = ${status} THEN 0
            ELSE 1
          END
        `,
          sortDirection(sortColumn),
          desc(ashStudent.createdAt),
        ];

  const [ashStudents, [totalDocuments], [metaData]] = await Promise.all([
    db
      .select()
      .from(ashStudent)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(ashStudent.id) }).from(ashStudent),
    db
      .select({
        acceptedStudents: sql<number>`
      COUNT(${ashStudent.id}) FILTER (WHERE ${ashStudent.status} = 'accepted')
    `,
        rejectedStudents: sql<number>`
      COUNT(${ashStudent.id}) FILTER (WHERE ${ashStudent.status} = 'rejected')
    `,
        pendingStudents: sql<number>`
      COUNT(${ashStudent.id}) FILTER (WHERE ${ashStudent.status} = 'pending')
    `,
      })
      .from(ashStudent),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(
    key,
    {
      data: ashStudents,
      totalPages,
      metadata: {
        totalSubmissions: Number(totalDocuments?.value ?? 0),
        acceptedStudents: Number(metaData?.acceptedStudents ?? 0),
        rejectedStudents: Number(metaData?.rejectedStudents ?? 0),
        pendingStudents: Number(metaData?.pendingStudents ?? 0),
      },
    },
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 200,
    message: "Ash students found successfully",
    data: ashStudents,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      metadata: {
        totalSubmissions: Number(totalDocuments?.value ?? 0),
        acceptedStudents: Number(metaData?.acceptedStudents ?? 0),
        rejectedStudents: Number(metaData?.rejectedStudents ?? 0),
        pendingStudents: Number(metaData?.pendingStudents ?? 0),
      },
      correlationId,
    },
  };
};
export const getRegistration = async (id: string) => {
  /// cache
  const key = `cedarrise:ash:ashStudents:${id}`;
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
export const updateAshStudentStatus = async (id: string, status: string, correlationId: string) => {
  // update
  const [updatedStudent] = await db
    .update(ashStudent)
    .set({
      status,
    })
    .where(eq(ashStudent.id, id))
    .returning({
      id: ashStudent.id,
      status: ashStudent.status,
      name: ashStudent.firstName,
    });

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:ashStudents:*`,
    event: "UPDATE ASH STUDENT STATUS",
    correlationId,
  });

  // emitter to send email on accept or reject
  // if (status === "accepted") {
  //   appEvents.emit(ASH_EVENTS.STUDENT_ACCEPTED, {name: updatedStudent?.name, userId: updatedStudent?.id,  /*email: updatedStudent.email,*/ correlationId});
  // } else if (status === "rejected") {
  //   appEvents.emit(ASH_EVENTS.STUDENT_ACCEPTED, {name: updatedStudent?.name, userId: updatedStudent?.id, /*email: updatedStudent.email*,/ correlationId});
  // }

  return {
    code: 200,
    message: "Ash student status updated successfully",
    data: updatedStudent,
    meta: {
      correlationId,
    },
  };
};
export const assignAshMentor = async (id: string, mentor: string, correlationId: string) => {
  // update
  const [updatedStudent] = await db
    .update(ashStudent)
    .set({
      assignedMentor: mentor,
    })
    .where(eq(ashStudent.id, id))
    .returning({
      id: ashStudent.id,
      status: ashStudent.status,
      assignedMentor: ashStudent.assignedMentor,
    });

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:ashStudents:*`,
    event: "ASSIGN ASH STUDENT MENTOR",
    correlationId,
  });

  // emitter to send email on notifying mentor and mentee

  return {
    code: 200,
    message: "Mentor assigned to Ash student successfully",
    data: updatedStudent,
    meta: {
      correlationId,
    },
  };
};
export const deleteRegistration = async (id: string, correlationId: string) => {
  const [data] = await db.delete(ashStudent).where(eq(ashStudent.id, id)).returning({
    passportPhotoPublicId: ashStudent.passportPhotoPublicId,
    lastResultPublicId: ashStudent.lastResultPublicId,
    parentSignaturePublicId: ashStudent.parentSignaturePublicId,
  });

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:ashStudents:*`,
    event: "DELETE ASH STUDENT REGISTRATION RECORD",
    correlationId,
  });

  if (data?.passportPhotoPublicId) {
    try {
      await addAssetToDeletionQueue(data.passportPhotoPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add passport photo public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.parentSignaturePublicId) {
    try {
      await addAssetToDeletionQueue(data.parentSignaturePublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add parent signature public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.lastResultPublicId) {
    try {
      await addAssetToDeletionQueue(data.lastResultPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add last result public id to queue`, {
        user: id,
      });
    }
  }

  return {
    code: 200,
    message: "Ash student data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportAshStudentTableToCSV = async () => {
  const data = await db.select().from(ashStudent);
  return data;
};

// ASH FEEDBACK
export const submitFeedback = async (options: AshprogramfeedbackType, correlationId: string) => {
  const [user] = await db
    .select()
    .from(ashStudent)
    .where(eq(ashStudent.surname, options.studentSurname));

  if (!user) {
    throw new NotFoundError("ASH student not found");
  }

  const [newAshProgramFeedback] = await db
    .insert(ashProgramFeedback)
    .values({
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

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:feedback:*`,
    event: "SUBMIT ASH STUDENT FEEDBACK",
    correlationId,
  });

  return {
    code: 201,
    message: "Ash Program feedback form submitted successfully",
    data: newAshProgramFeedback,
    meta: {
      correlationId,
    },
  };
};
export const listFeedback = async (
  page: number,
  limit: number,
  search: string,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${ashProgramFeedback.studentFirstName}), 'A') ||
      setweight(to_tsvector('english', ${ashProgramFeedback.studentSurname}), 'A') ||
      setweight(to_tsvector('english', ${ashProgramFeedback.schoolName}), 'A') ||
      setweight(to_tsvector('english', ${ashProgramFeedback.currentClass}), 'B') ||
      setweight(to_tsvector('english', coalesce(${ashProgramFeedback.parentPhone}, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${ashProgramFeedback.enjoyedParts}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${ashProgramFeedback.mostValuableAspects}, ' '), '')), 'C')
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [allProgramFeedback, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(ashProgramFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(ashProgramFeedback.id) })
        .from(ashProgramFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Ash program feedback found successfully",
      data: allProgramFeedback,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:ash:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Ash program feedback found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///

  const [allProgramFeedback, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(ashProgramFeedback)
      .orderBy(desc(ashProgramFeedback.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(ashProgramFeedback.id) }).from(ashProgramFeedback),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: allProgramFeedback, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Ash program feedback found successfully",
    data: allProgramFeedback,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
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
export const deleteFeedback = async (id: string, correlationId: string) => {
  await db.delete(ashProgramFeedback).where(eq(ashProgramFeedback.id, id));

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:feedback:*`,
    event: "SUBMIT ASH STUDENT FEEDBACK",
    correlationId,
  });

  return {
    code: 200,
    message: "Ash feedback data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportAshFeedbackTableToCSV = async () => {
  const data = await db.select().from(ashProgramFeedback);
  return data;
};

// ASH TRACKERS CARDS DATA
export const getAshTrackersCardsData = async () => {
  /// cache
  const key = "cedarrise:ashtrackercardsdata";
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return cacheRes;
  }
  ///

  const currentYear = new Date().getFullYear();

  const [
    [totalAshTermlyTrackingRecords],
    [totalWeeklyAttendanceRecords],
    [totalAshExitRecords],
    [studentStats],
    [totalAtRiskStudents],
    [attendanceStats],
    [totalCompletedExitRecords],
  ] = await Promise.all([
    // totalRecords (ashTermlyTracking + ashWeeklyAttendance + totalAshExitRecords)
    db.select({ value: count(ashTermlyTracking.id) }).from(ashTermlyTracking),
    db.select({ value: count(ashWeeklyAttendance.id) }).from(ashWeeklyAttendance),
    db.select({ value: count(ashExit.id) }).from(ashExit),
    // total accepted students
    db
      .select({ value: count(ashStudent.id) })
      .from(ashStudent)
      .where(eq(ashStudent.status, "accepted")),
    // highRiskStudents (ashTermlyTracking)
    db
      .select({
        value: countDistinct(ashTermlyTracking.studentId),
      })
      .from(ashTermlyTracking)
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${ashTermlyTracking.createdAt}) = ${currentYear}`,
          lt(ashTermlyTracking.posttestAverage, 50),
        ),
      ),
    // avgAttendance
    db
      .select({
        totalAttendees: sql<number>`
      COALESCE(SUM(cardinality(${ashWeeklyAttendance.studentsInAttendance})), 0)
    `,
        totalSessions: sql<number>`
      COUNT(${ashWeeklyAttendance.id})
    `,
      })
      .from(ashWeeklyAttendance)
      .where(sql`EXTRACT(YEAR FROM ${ashWeeklyAttendance.sessionDate}) = ${currentYear}`),
    // completed (ashExit)
    db
      .select({ value: countDistinct(ashExit.studentId) })
      .from(ashExit)
      .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"])),
  ]);

  const totalPossibleAttendance =
    Number(attendanceStats?.totalSessions ?? 0) * Number(studentStats?.value ?? 0);
  /// cache set
  await cacheSet(
    key,
    {
      totalRecords:
        Number(totalAshTermlyTrackingRecords?.value ?? 0) +
        Number(totalWeeklyAttendanceRecords?.value ?? 0) +
        Number(totalAshExitRecords?.value ?? 0),
      highRiskStudents: Number(totalAtRiskStudents?.value ?? 0),
      avgAttendanceRate:
        totalPossibleAttendance > 0
          ? Math.ceil(((attendanceStats?.totalAttendees ?? 0) / totalPossibleAttendance) * 100)
          : 0,
      completed: Number(totalCompletedExitRecords?.value ?? 0),
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );

  return {
    totalRecords:
      Number(totalAshTermlyTrackingRecords?.value ?? 0) +
      Number(totalWeeklyAttendanceRecords?.value ?? 0) +
      Number(totalAshExitRecords?.value ?? 0),
    highRiskStudents: Number(totalAtRiskStudents?.value ?? 0),
    avgAttendanceRate:
      totalPossibleAttendance > 0
        ? Math.ceil(((attendanceStats?.totalAttendees ?? 0) / totalPossibleAttendance) * 100)
        : 0,
    completed: Number(totalCompletedExitRecords?.value ?? 0),
  };
};

// ASH TRACKING
export const submitTracking = async (
  req: Request,
  options: AshtermlytrackingbodyType,
  correlationId: string,
) => {
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

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:termlytracking:*`,
    event: "SUBMIT ASH STUDENT TRACKING",
    correlationId,
  });

  return {
    code: 201,
    message: "Tracker form submitted successfully",
    data: tracker,
    meta: {
      correlationId,
    },
  };
};
export const listTracking = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof termlySortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', concat_ws(' ', ${ashTermlyTracking.academicSession}, ${ashStudent.firstName}, ${ashStudent.surname})), 'A') ||
      setweight(to_tsvector('english', ${ashTermlyTracking.term}), 'A') ||
      setweight(to_tsvector('english', ${ashTermlyTracking.schoolName}), 'B') ||
      setweight(to_tsvector('english', ${ashTermlyTracking.mentorName}), 'B') 
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [tracking, [totalDocuments]] = await Promise.all([
      db
        .select({
          firstName: ashStudent.firstName,
          surname: ashStudent.surname,
          id: ashTermlyTracking.id,
          studentId: ashTermlyTracking.studentId,
          academicSession: ashTermlyTracking.academicSession,
          term: ashTermlyTracking.term,
          schoolName: ashTermlyTracking.schoolName,
          schoolNumeracyScore: ashTermlyTracking.schoolNumeracyScore,
          schoolLiteracyScore: ashTermlyTracking.schoolLiteracyScore,
          schoolAverage: ashTermlyTracking.schoolAverage,
          schoolPosition: ashTermlyTracking.schoolPosition,
          pretestNumeracyScore: ashTermlyTracking.pretestNumeracyScore,
          pretestLiteracyScore: ashTermlyTracking.pretestLiteracyScore,
          pretestAverage: ashTermlyTracking.pretestAverage,
          midtestNumeracyScore: ashTermlyTracking.midtestNumeracyScore,
          midtestLiteracyScore: ashTermlyTracking.midtestLiteracyScore,
          midtestAverage: ashTermlyTracking.midtestAverage,
          posttestNumeracyScore: ashTermlyTracking.posttestNumeracyScore,
          posttestLiteracyScore: ashTermlyTracking.posttestLiteracyScore,
          posttestAverage: ashTermlyTracking.posttestAverage,
          disciplineRating: ashTermlyTracking.disciplineRating,
          responsibilityRating: ashTermlyTracking.responsibilityRating,
          leadershipRating: ashTermlyTracking.leadershipRating,
          notableAchievements: ashTermlyTracking.notableAchievements,
          challengesObserved: ashTermlyTracking.challengesObserved,
          nextTermRecommendations: ashTermlyTracking.nextTermRecommendations,
          mentorName: ashTermlyTracking.mentorName,
          termResultUrl: ashTermlyTracking.termResultUrl,
          termResultPublicId: ashTermlyTracking.termResultPublicId,
          updatedAt: ashTermlyTracking.updatedAt,
          createdAt: ashTermlyTracking.createdAt,
          deletedAt: ashTermlyTracking.deletedAt,
        })
        .from(ashTermlyTracking)
        .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(ashTermlyTracking.id) })
        .from(ashTermlyTracking)
        .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Tracking data found successfully",
      data: tracking,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:ash:termlytracking:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tracking data found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        metadata: cacheRes.metadata,
        correlationId,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = termlySortMap[sortBy] ?? ashTermlyTracking.createdAt;
  const orderby =
    sortColumn === ashTermlyTracking.createdAt
      ? [desc(ashTermlyTracking.createdAt)]
      : [sortDirection(sortColumn), desc(ashTermlyTracking.createdAt)];

  const [tracking, [totalDocuments], metaData] = await Promise.all([
    db
      .select({
        firstName: ashStudent.firstName,
        surname: ashStudent.surname,
        id: ashTermlyTracking.id,
        studentId: ashTermlyTracking.studentId,
        academicSession: ashTermlyTracking.academicSession,
        term: ashTermlyTracking.term,
        schoolName: ashTermlyTracking.schoolName,
        schoolNumeracyScore: ashTermlyTracking.schoolNumeracyScore,
        schoolLiteracyScore: ashTermlyTracking.schoolLiteracyScore,
        schoolAverage: ashTermlyTracking.schoolAverage,
        schoolPosition: ashTermlyTracking.schoolPosition,
        pretestNumeracyScore: ashTermlyTracking.pretestNumeracyScore,
        pretestLiteracyScore: ashTermlyTracking.pretestLiteracyScore,
        pretestAverage: ashTermlyTracking.pretestAverage,
        midtestNumeracyScore: ashTermlyTracking.midtestNumeracyScore,
        midtestLiteracyScore: ashTermlyTracking.midtestLiteracyScore,
        midtestAverage: ashTermlyTracking.midtestAverage,
        posttestNumeracyScore: ashTermlyTracking.posttestNumeracyScore,
        posttestLiteracyScore: ashTermlyTracking.posttestLiteracyScore,
        posttestAverage: ashTermlyTracking.posttestAverage,
        disciplineRating: ashTermlyTracking.disciplineRating,
        responsibilityRating: ashTermlyTracking.responsibilityRating,
        leadershipRating: ashTermlyTracking.leadershipRating,
        notableAchievements: ashTermlyTracking.notableAchievements,
        challengesObserved: ashTermlyTracking.challengesObserved,
        nextTermRecommendations: ashTermlyTracking.nextTermRecommendations,
        mentorName: ashTermlyTracking.mentorName,
        termResultUrl: ashTermlyTracking.termResultUrl,
        termResultPublicId: ashTermlyTracking.termResultPublicId,
        updatedAt: ashTermlyTracking.updatedAt,
        createdAt: ashTermlyTracking.createdAt,
        deletedAt: ashTermlyTracking.deletedAt,
      })
      .from(ashTermlyTracking)
      .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),

    db.select({ value: count(ashTermlyTracking.id) }).from(ashTermlyTracking),
    getAshTrackersCardsData(),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: tracking, totalPages, metadata: metaData }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tracking data found successfully",
    data: tracking,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      metadata: metaData,
      correlationId,
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

  const [track] = await db
    .select({
      firstName: ashStudent.firstName,
      surname: ashStudent.surname,
      id: ashTermlyTracking.id,
      studentId: ashTermlyTracking.studentId,
      academicSession: ashTermlyTracking.academicSession,
      term: ashTermlyTracking.term,
      schoolName: ashTermlyTracking.schoolName,
      schoolNumeracyScore: ashTermlyTracking.schoolNumeracyScore,
      schoolLiteracyScore: ashTermlyTracking.schoolLiteracyScore,
      schoolAverage: ashTermlyTracking.schoolAverage,
      schoolPosition: ashTermlyTracking.schoolPosition,
      pretestNumeracyScore: ashTermlyTracking.pretestNumeracyScore,
      pretestLiteracyScore: ashTermlyTracking.pretestLiteracyScore,
      pretestAverage: ashTermlyTracking.pretestAverage,
      midtestNumeracyScore: ashTermlyTracking.midtestNumeracyScore,
      midtestLiteracyScore: ashTermlyTracking.midtestLiteracyScore,
      midtestAverage: ashTermlyTracking.midtestAverage,
      posttestNumeracyScore: ashTermlyTracking.posttestNumeracyScore,
      posttestLiteracyScore: ashTermlyTracking.posttestLiteracyScore,
      posttestAverage: ashTermlyTracking.posttestAverage,
      disciplineRating: ashTermlyTracking.disciplineRating,
      responsibilityRating: ashTermlyTracking.responsibilityRating,
      leadershipRating: ashTermlyTracking.leadershipRating,
      notableAchievements: ashTermlyTracking.notableAchievements,
      challengesObserved: ashTermlyTracking.challengesObserved,
      nextTermRecommendations: ashTermlyTracking.nextTermRecommendations,
      mentorName: ashTermlyTracking.mentorName,
      termResultUrl: ashTermlyTracking.termResultUrl,
      termResultPublicId: ashTermlyTracking.termResultPublicId,
      updatedAt: ashTermlyTracking.updatedAt,
      createdAt: ashTermlyTracking.createdAt,
      deletedAt: ashTermlyTracking.deletedAt,
    })
    .from(ashTermlyTracking)
    .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
    .where(eq(ashTermlyTracking.id, id));

  /// cache set
  await cacheSet(key, track, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Track data found successfully",
    data: track,
  };
};
export const deleteTrack = async (id: string, correlationId: string) => {
  const [data] = await db.delete(ashTermlyTracking).where(eq(ashTermlyTracking.id, id)).returning({
    termResultPublicId: ashTermlyTracking.termResultPublicId,
  });

  if (data?.termResultPublicId) {
    try {
      await addAssetToDeletionQueue(data.termResultPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add term result public id to queue`, {
        user: id,
      });
    }
  }

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:termlytracking:*`,
    event: "DELETE ASH STUDENT TRACKING",
    correlationId,
  });

  return {
    code: 200,
    message: "Ash tracking data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportAshTermlyTrackingTableToCSV = async () => {
  const data = await db.select().from(ashTermlyTracking);
  return data;
};

// ASH ATTENDANCE
export const submitAttendance = async (
  options: AshweeklyattendancebodyType,
  correlationId: string,
) => {
  const [attendance] = await db
    .insert(ashWeeklyAttendance)
    .values({
      sessionDate: sql`TO_DATE(${options.sessionDate}, 'YYYY-MM-DD')`,
      studentsInAttendance: options.studentsInAttendance,
      studentsMentored: options.studentsMentored,
      sessionsConducted: options.sessionsConducted,
      sessionDetails: options.sessionDetails,
      volunteersInAttendance: options.volunteersInAttendance,
      programReview: options.programReview,
    })
    .returning();

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:weeklyattendance:*`,
    event: "SUBMIT ASH STUDENT WEEKLY ATTENDANCE",
    correlationId,
  });

  return {
    code: 201,
    message: "Attendance form submitted successfully",
    data: attendance,
    meta: { correlationId },
  };
};
export const listAttendance = async (
  page: number,
  limit: number,
  search: string,
  correlationId: string,
) => {
  // search
  if (search) {
    const studentName = sql<string>`
      concat_ws(' ', ${ashStudent.firstName}, ${ashStudent.surname})
    `;

    const joinCondition = sql`
      ${ashStudent.id} = ANY(${ashWeeklyAttendance.studentsInAttendance})
      OR
      ${ashStudent.id} = ANY(${ashWeeklyAttendance.studentsMentored})
    `;

    const searchVector = sql`
      setweight(to_tsvector('english', coalesce(${ashWeeklyAttendance.volunteersInAttendance}, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(${ashWeeklyAttendance.sessionDetails}, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${ashWeeklyAttendance.sessionsConducted}, ' '), '')), 'A') ||
      setweight(to_tsvector('english', coalesce(string_agg(distinct ${studentName}, ' '), '')), 'A')
    `;

    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [attendance, matchingRows] = await Promise.all([
      db
        .select({
          ...getTableColumns(ashWeeklyAttendance),
        })
        .from(ashWeeklyAttendance)
        .leftJoin(ashStudent, joinCondition)
        .groupBy(ashWeeklyAttendance.id)
        .having(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ id: ashWeeklyAttendance.id })
        .from(ashWeeklyAttendance)
        .innerJoin(ashStudent, joinCondition)
        .groupBy(ashWeeklyAttendance.id)
        .having(sql`${searchVector} @@ ${searchQuery}`)
        .as("matching_rows"),
    ]);
    const [totalDocuments] = await db.select({ value: count() }).from(matchingRows);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    const allStudentIds = [
      ...new Set(attendance.flatMap((r) => [...r.studentsInAttendance, ...r.studentsMentored])),
    ];
    const studentRows = allStudentIds.length
      ? await db
          .select({
            id: ashStudent.id,
            firstName: ashStudent.firstName,
            surname: ashStudent.surname,
          })
          .from(ashStudent)
          .where(inArray(ashStudent.id, allStudentIds))
      : [];
    const nameMap = Object.fromEntries(
      studentRows.map((s) => [s.id, `${s.firstName} ${s.surname}`]),
    );

    const resolvedAttendance = attendance.map((r) => ({
      ...r,
      studentsInAttendance: r.studentsInAttendance.map((id) => nameMap[id] ?? id),
      studentsMentored: r.studentsMentored.map((id) => nameMap[id] ?? id),
    }));

    return {
      code: 200,
      message: "Attendance data found successfully",
      data: resolvedAttendance,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:ash:weeklyattendance:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Attendance data found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///

  const [attendance, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(ashWeeklyAttendance)
      .orderBy(ashWeeklyAttendance.createdAt)
      .limit(limit)
      .offset((page - 1) * limit),

    db.select({ value: count(ashWeeklyAttendance.id) }).from(ashWeeklyAttendance),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  const allStudentIds = [
    ...new Set(attendance.flatMap((r) => [...r.studentsInAttendance, ...r.studentsMentored])),
  ];
  const studentRows = allStudentIds.length
    ? await db
        .select({ id: ashStudent.id, firstName: ashStudent.firstName, surname: ashStudent.surname })
        .from(ashStudent)
        .where(inArray(ashStudent.id, allStudentIds))
    : [];
  const nameMap = Object.fromEntries(studentRows.map((s) => [s.id, `${s.firstName} ${s.surname}`]));

  const resolvedAttendance = attendance.map((r) => ({
    ...r,
    studentsInAttendance: r.studentsInAttendance.map((id) => nameMap[id] ?? id),
    studentsMentored: r.studentsMentored.map((id) => nameMap[id] ?? id),
  }));

  /// cache set
  await cacheSet(key, { data: resolvedAttendance, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Attendance data found successfully",
    data: resolvedAttendance,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
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

  const [studentsAttended, studentsMentored] = await Promise.all([
    db
      .select({
        firstName: ashStudent.firstName,
        surname: ashStudent.surname,
      })
      .from(ashStudent)
      .where(inArray(ashStudent.id, attendance!.studentsInAttendance)),
    db
      .select({
        firstName: ashStudent.firstName,
        surname: ashStudent.surname,
      })
      .from(ashStudent)
      .where(inArray(ashStudent.id, attendance!.studentsMentored)),
  ]);

  const studentsAttendedNames = studentsAttended.map((s) => `${s.firstName} ${s.surname}`);
  const studentsMentoredNames = studentsMentored.map((s) => `${s.firstName} ${s.surname}`);

  /// cache set
  await cacheSet(
    key,
    {
      ...attendance,
      studentsInAttendance: studentsAttendedNames,
      studentsMentored: studentsMentoredNames,
    },
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 200,
    message: "Attendance found successfully",
    data: {
      ...attendance,
      studentsInAttendance: studentsAttendedNames,
      studentsMentored: studentsMentoredNames,
    },
  };
};
export const deleteAttendance = async (id: string, correlationId: string) => {
  await db.delete(ashWeeklyAttendance).where(eq(ashWeeklyAttendance.id, id));

  ///
  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:weeklyattendance:*`,
    event: "SUBMIT ASH STUDENT WEEKLY ATTENDANCE",
    correlationId,
  });

  return {
    code: 200,
    message: "Ash attendance data deleted successfully",
    meta: { correlationId },
  };
};
export const exportAshAttendanceTableToCSV = async () => {
  const data = await db.select().from(ashWeeklyAttendance);
  return data;
};

// ASH EXIT
export const submitExit = async (options: AshexitbodyType, correlationId: string) => {
  const [exit] = await db
    .insert(ashExit)
    .values({
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

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:exit:*`,
    event: "SUBMIT ASH STUDENT EXIT FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Exit form submitted successfully",
    data: exit,
    meta: {
      correlationId,
    },
  };
};
export const listExit = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof exitSortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', concat_ws(' ', ${ashExit.schoolName}, ${ashStudent.firstName}, ${ashStudent.surname})), 'A') ||
      setweight(to_tsvector('english', ${ashExit.classAtExit}), 'B') ||
      setweight(to_tsvector('english', ${ashExit.durationInProgram}), 'B') ||
      setweight(to_tsvector('english', ${ashExit.exitReason}), 'C') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${ashExit.areasOfImprovement}, ' '), '')), 'C') 
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [exit, [totalDocuments]] = await Promise.all([
      db
        .select({
          firstName: ashStudent.firstName,
          surname: ashStudent.surname,
          id: ashExit.id,
          studentId: ashExit.studentId,
          ageAtExit: ashExit.ageAtExit,
          schoolName: ashExit.schoolName,
          classAtExit: ashExit.classAtExit,
          durationInProgram: ashExit.durationInProgram,
          exitReason: ashExit.exitReason,
          academicImpactRating: ashExit.academicImpactRating,
          areasOfImprovement: ashExit.areasOfImprovement,
          mentorshipReceived: ashExit.mentorshipReceived,
          mentorshipImpactRating: ashExit.mentorshipImpactRating,
          postAshStatus: ashExit.postAshStatus,
          institutionName: ashExit.institutionName,
          courseOfStudy: ashExit.courseOfStudy,
          vocationalSkill: ashExit.vocationalSkill,
          enjoyedMost: ashExit.enjoyedMost,
          programImpact: ashExit.programImpact,
          improvementSuggestions: ashExit.improvementSuggestions,
          facilitatorName: ashExit.facilitatorName,
          exitDate: ashExit.exitDate,
          updatedAt: ashExit.updatedAt,
          createdAt: ashExit.createdAt,
          deletedAt: ashExit.deletedAt,
        })
        .from(ashExit)
        .innerJoin(ashStudent, eq(ashStudent.id, ashExit.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(ashExit.id) })
        .from(ashExit)
        .innerJoin(ashStudent, eq(ashStudent.id, ashExit.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Exit data found successfully",
      data: exit,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }
  /// cache
  const key = `cedarrise:ash:exit:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Exit data found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = exitSortMap[sortBy] ?? ashExit.createdAt;
  const orderby =
    sortColumn === ashExit.createdAt
      ? [desc(ashExit.createdAt)]
      : [sortDirection(sortColumn), desc(ashExit.createdAt)];
  const [exit, [totalDocuments]] = await Promise.all([
    db
      .select({
        firstName: ashStudent.firstName,
        surname: ashStudent.surname,
        id: ashExit.id,
        studentId: ashExit.studentId,
        ageAtExit: ashExit.ageAtExit,
        schoolName: ashExit.schoolName,
        classAtExit: ashExit.classAtExit,
        durationInProgram: ashExit.durationInProgram,
        exitReason: ashExit.exitReason,
        academicImpactRating: ashExit.academicImpactRating,
        areasOfImprovement: ashExit.areasOfImprovement,
        mentorshipReceived: ashExit.mentorshipReceived,
        mentorshipImpactRating: ashExit.mentorshipImpactRating,
        postAshStatus: ashExit.postAshStatus,
        institutionName: ashExit.institutionName,
        courseOfStudy: ashExit.courseOfStudy,
        vocationalSkill: ashExit.vocationalSkill,
        enjoyedMost: ashExit.enjoyedMost,
        programImpact: ashExit.programImpact,
        improvementSuggestions: ashExit.improvementSuggestions,
        facilitatorName: ashExit.facilitatorName,
        exitDate: ashExit.exitDate,
        updatedAt: ashExit.updatedAt,
        createdAt: ashExit.createdAt,
        deletedAt: ashExit.deletedAt,
      })
      .from(ashExit)
      .innerJoin(ashStudent, eq(ashStudent.id, ashExit.studentId))
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(ashExit.id) }).from(ashExit),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: exit, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Exit data found successfully",
    data: exit,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
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

  const [exit] = await db
    .select({
      firstName: ashStudent.firstName,
      surname: ashStudent.surname,
      id: ashExit.id,
      studentId: ashExit.studentId,
      ageAtExit: ashExit.ageAtExit,
      schoolName: ashExit.schoolName,
      classAtExit: ashExit.classAtExit,
      durationInProgram: ashExit.durationInProgram,
      exitReason: ashExit.exitReason,
      academicImpactRating: ashExit.academicImpactRating,
      areasOfImprovement: ashExit.areasOfImprovement,
      mentorshipReceived: ashExit.mentorshipReceived,
      mentorshipImpactRating: ashExit.mentorshipImpactRating,
      postAshStatus: ashExit.postAshStatus,
      institutionName: ashExit.institutionName,
      courseOfStudy: ashExit.courseOfStudy,
      vocationalSkill: ashExit.vocationalSkill,
      enjoyedMost: ashExit.enjoyedMost,
      programImpact: ashExit.programImpact,
      improvementSuggestions: ashExit.improvementSuggestions,
      facilitatorName: ashExit.facilitatorName,
      exitDate: ashExit.exitDate,
      updatedAt: ashExit.updatedAt,
      createdAt: ashExit.createdAt,
      deletedAt: ashExit.deletedAt,
    })
    .from(ashExit)
    .innerJoin(ashStudent, eq(ashStudent.id, ashExit.studentId))
    .where(eq(ashExit.id, id));

  /// cache set
  await cacheSet(key, exit, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "exit found successfully",
    data: exit,
  };
};
export const deleteExit = async (id: string, correlationId: string) => {
  await db.delete(ashExit).where(eq(ashExit.id, id));

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ash:exit:*`,
    event: "DELETE ASH STUDENT EXIT RECORD",
    correlationId,
  });

  return {
    code: 200,
    message: "Ash exit data deleted successfully",
    meta: { correlationId },
  };
};
export const exportAshExitTableToCSV = async () => {
  const data = await db.select().from(ashExit);
  return data;
};

export const example = async (page: number, limit: number, id: string) => {};
