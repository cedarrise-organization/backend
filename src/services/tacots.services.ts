import { addAssetToDeletionQueue } from "../queues/deleteCloudinaryAsset.queue.js";
import { cacheSet, cacheGet, CACHE_TTL } from "../lib/cache.js";
import { uploadToCloudinary } from "../utils/storage.util.js";
import { TACOTS_EVENTS } from "../events/tacots.events.js";
import { invalidateCache } from "../utils/cache.util.js";
import { sql, asc, and, desc, eq, lt, count, inArray, countDistinct } from "drizzle-orm";
import { UploadApiResponse } from "cloudinary";
import { appEvents } from "../lib/events.js";
import { Request } from "express";
import {
  TacotsrecommendationbodyType,
  TacotsfeedbackbodyType,
  TacotsonboardingbodyType,
  TacotstrackingbodyType,
  TacotsexitbodyType,
} from "../modules/tacots/tacots.schema.js";
import {
  tacotsRecommendation,
  tacotsFeedback,
  tacotsOnboarding,
  tacotsTracking,
  tacotsExit,
} from "../db/models/admin.js";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
import { NotFoundError } from "../lib/error.js";

const sortMap = {
  firstName: tacotsRecommendation.firstName,
  surname: tacotsRecommendation.surname,
  gender: tacotsRecommendation.gender,
  schoolName: tacotsRecommendation.schoolName,
  lastClass: tacotsRecommendation.lastClass,
  createdAt: tacotsRecommendation.createdAt,
} as const;
const trackingSortMap = {
  academicSession: tacotsTracking.academicSession,
  academicTerm: tacotsTracking.academicTerm,
  region: tacotsTracking.region,
  studentAveragePct: tacotsTracking.studentAveragePct,
  assessmentPeriod: tacotsTracking.assessmentPeriod,
  createdAt: tacotsTracking.createdAt,
} as const;
const onboardingSortMap = {
  onboardingDate: tacotsOnboarding.onboardingDate,
  generalHealthStatus: tacotsOnboarding.generalHealthStatus,
  enrolledSchoolName: tacotsOnboarding.enrolledSchoolName,
  enrolledSchoolState: tacotsOnboarding.enrolledSchoolState,
  enrolledClass: tacotsOnboarding.enrolledClass,
  createdAt: tacotsOnboarding.createdAt,
} as const;
const exitSortMap = {
  schoolAttendedDuringProgram: tacotsExit.schoolAttendedDuringProgram,
  yearOfExit: tacotsExit.yearOfExit,
  exitReason: tacotsExit.exitReason,
  highestEducationAttained: tacotsExit.highestEducationAttained,
  createdAt: tacotsExit.createdAt,
} as const;

// RECOMMENDATION
export const submitRecommendation = async (
  req: Request,
  options: TacotsrecommendationbodyType,
  correlationId: string,
) => {
  const files = req.files as {
    passportPhoto: Express.Multer.File[];
    lastResult: Express.Multer.File[];
  };

  const passportFile = files.passportPhoto?.[0];
  const resultFile = files.lastResult?.[0];

  const passportUpload: UploadApiResponse | undefined | null = passportFile
    ? await uploadToCloudinary(passportFile, "/Cedarrise Initiative/TACOTS-ASSETS/PASSPORTS")
    : null;

  const resultUpload: UploadApiResponse | undefined | null = resultFile
    ? await uploadToCloudinary(resultFile, "/Cedarrise Initiative/TACOTS-ASSETS/RESULTS")
    : null;

  if (!passportUpload || !resultUpload) {
    throw new Error(`Could not upload passport or result`);
  }

  const [newTacotsRecommendation] = await db
    .insert(tacotsRecommendation)
    .values({
      firstName: options.firstName,
      middleName: options.middleName,
      surname: options.surname,
      gender: options.gender,
      age: options.age,
      dob: sql`TO_DATE(${options.dob}, 'YYYY-MM-DD')`,
      religion: options.religion,
      catholicSacraments: options.catholicSacraments,
      parishAttended: options.parishAttended,
      diocese: options.diocese,
      primaryLanguage: options.primaryLanguage,
      phoneNumber: options.phoneNumber,
      nationality: options.nationality,
      stateOfOrigin: options.stateOfOrigin,
      lga: options.lga,
      homeAddress: options.homeAddress,
      schoolName: options.schoolName,
      schoolTown: options.schoolTown,
      schoolState: options.schoolState,
      lastYearAttended: options.lastYearAttended,
      lastClass: options.lastClass,
      classPositionLastTerm: options.classPositionLastTerm,
      lastTermAverage: options.lastTermAverage,
      passportPhotoUrl: passportUpload ? passportUpload.secure_url : "",
      lastResultUrl: resultUpload ? resultUpload.secure_url : "",
      passportPhotoPublicId: passportUpload ? passportUpload.public_id : "",
      lastResultPublicId: resultUpload ? resultUpload.public_id : "",
      fathersName: options.fathersName,
      fathersOccupation: options.fathersOccupation,
      fathersPhone: options.fathersPhone,
      mothersName: options.mothersName,
      mothersOccupation: options.mothersOccupation,
      mothersPhone: options.mothersPhone,
      parentsAddress: options.parentsAddress,
      guardianName: options.guardianName,
      guardianPhone: options.guardianPhone,
      guardianRelationship: options.guardianRelationship,
      guardianOccupation: options.guardianOccupation,
      guardianAddress: options.guardianAddress,
      householdSize: options.householdSize,
      numSiblings: options.numSiblings,
      familyPosition: options.familyPosition,
      specialCircumstances: options.specialCircumstances,
      annualHouseholdIncome: options.annualHouseholdIncome,
      incomeSources: options.incomeSources,
      numIncomeEarners: options.numIncomeEarners,
      avgMonthlyIncome: options.avgMonthlyIncome,
      livesWith: options.livesWith,
      residenceType: options.residenceType,
      hasElectricity: options.hasElectricity,
      recommenderFirstName: options.recommenderFirstName,
      recommenderLastName: options.recommenderLastName,
      recommenderPhone: options.recommenderPhone,
      recommenderAddress: options.recommenderAddress,
      childBackgroundNotes: options.childBackgroundNotes,
      supportTypesNeeded: options.supportTypesNeeded,
      otherImportantInfo: options.otherImportantInfo,
      disciplineRating: options.disciplineRating,
      responsibilityRating: options.responsibilityRating,
      careerGoal: options.careerGoal,
      studentStatement: options.studentStatement,
      declarationConfirmed: options.declarationConfirmed,
    })
    .returning();

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:tacotsRecommendation:*`,
    event: "SUBMIT TACOTS RECOMMENDATION FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Tacots reccomendation form submitted successfully",
    data: newTacotsRecommendation,
    meta: {
      correlationId,
    },
  };
};
export const listRecommendations = async (
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
      setweight(to_tsvector('english', ${tacotsRecommendation.firstName}), 'A') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.surname}), 'A') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.stateOfOrigin}), 'B') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.lga}), 'B') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.schoolName}), 'B') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.lastClass}), 'C') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.recommenderFirstName}), 'C') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.recommenderLastName}), 'C') ||
      setweight(to_tsvector('english', array_to_string(${tacotsRecommendation.incomeSources}, ' ')), 'D') ||
      setweight(to_tsvector('english', array_to_string(${tacotsRecommendation.supportTypesNeeded}, ' ')), 'D') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsRecommendation.catholicSacraments}, ' '), '')), 'D')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [tacotsBeneficiaries, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(tacotsRecommendation)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(tacotsRecommendation.id) })
        .from(tacotsRecommendation)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Tacots beneficiaries found successfully",
      data: tacotsBeneficiaries,
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
  const key = `cedarrise:tacots:tacotsRecommendation:${page}:${limit}:${orderBy}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots beneficiaries found successfully",
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
  const sortColumn = sortMap[sortBy] ?? tacotsRecommendation.createdAt;
  const orderby =
    sortColumn === tacotsRecommendation.createdAt
      ? [
          sql`
            CASE
              WHEN ${tacotsRecommendation.adminStatus} = ${status} THEN 0
              ELSE 1
            END
          `,
          desc(tacotsRecommendation.createdAt),
        ]
      : [
          sql`
            CASE
              WHEN ${tacotsRecommendation.adminStatus} = ${status} THEN 0
              ELSE 1
            END
          `,
          sortDirection(sortColumn),
          desc(tacotsRecommendation.createdAt),
        ];

  const [tacotsBeneficiaries, [totalDocuments], [metaData]] = await Promise.all([
    db
      .select()
      .from(tacotsRecommendation)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(tacotsRecommendation.id) }).from(tacotsRecommendation),
    db
      .select({
        acceptedStudents: sql<number>`
          COUNT(${tacotsRecommendation.id}) FILTER (WHERE ${tacotsRecommendation.adminStatus} = 'SELECTED')
        `,
        rejectedStudents: sql<number>`
          COUNT(${tacotsRecommendation.id}) FILTER (WHERE ${tacotsRecommendation.adminStatus} = 'NOT SELECTED')
        `,
        pendingStudents: sql<number>`
          COUNT(${tacotsRecommendation.id}) FILTER (WHERE ${tacotsRecommendation.adminStatus} = 'KEEP IN VIEW')
        `,
      })
      .from(tacotsRecommendation),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(
    key,
    {
      data: tacotsBeneficiaries,
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
    message: "Ash beneficiaries found successfully",
    data: tacotsBeneficiaries,
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
export const getRecommendation = async (id: string) => {
  /// cache
  const key = `cedarrise:tacots:tacotsRecommendation:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots beneficiary found successfully",
      data: cacheRes,
    };
  }
  ///

  const [tacotBeneficiary] = await db
    .select()
    .from(tacotsRecommendation)
    .where(eq(tacotsRecommendation.id, id));

  /// cache set
  await cacheSet(key, tacotBeneficiary, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots beneficiary found successfully",
    data: tacotBeneficiary,
  };
};
export const updateRecommendedStudentStatus = async (
  id: string,
  status: string,
  correlationId: string,
) => {
  // update
  const [updatedStudent] = await db
    .update(tacotsRecommendation)
    .set({
      adminStatus: status,
    })
    .where(eq(tacotsRecommendation.id, id))
    .returning({
      id: tacotsRecommendation.id,
      status: tacotsRecommendation.adminStatus,
      name: tacotsRecommendation.firstName,
    });

  // delete all related cache
  await invalidateCache(
    `cedarrise:tacots:tacotsRecommendation:${id}`,
    `cedarrise:tacots:tacotsRecommendation:*`,
  );

  // emitter to send email on SELECTED or NOT SELECTED
  // if (status === "SELECTED") {
  //   appEvents.emit(TACOTS_EVENTS.APPLICANT_ACCEPTED, {
  //     name: updatedStudent?.name, userId: updatedStudent?.id,  /*email: updatedStudent.email*/, correlationId
  //   });
  // } else if (status === "NOT SELECTED") {
  //   appEvents.emit(TACOTS_EVENTS.APPLICANT_REJECTED, {
  //     name: updatedStudent?.name, userId: updatedStudent?.id,  /*email: updatedStudent.email*/, correlationId
  //   });
  // }

  return {
    code: 200,
    message: "Recommended TACOTS' student's status updated successfully",
    data: updatedStudent,
    meta: {
      correlationId,
    },
  };
};
export const deleteRecommendation = async (id: string, correlationId: string) => {
  const [data] = await db
    .delete(tacotsRecommendation)
    .where(eq(tacotsRecommendation.id, id))
    .returning({
      passportPhotoPublicId: tacotsRecommendation.passportPhotoPublicId,
      lastResultPublicId: tacotsRecommendation.lastResultPublicId,
    });

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:tacotsRecommendation:*`,
    event: "DELETE TACOTS RECOMMENDATION RECORD",
    correlationId,
  });

  if (data?.passportPhotoPublicId) {
    try {
      await addAssetToDeletionQueue(data.passportPhotoPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add passportphoto public id to queue`, {
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
    message: "Tacots beneficiary data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportTacotsRecommendationTableToCSV = async () => {
  const data = await db.select().from(tacotsRecommendation);
  return data;
};

// FEEDBACK
export const submitTacotsFeedback = async (
  options: TacotsfeedbackbodyType,
  correlationId: string,
) => {
  const [user] = await db
    .select()
    .from(tacotsRecommendation)
    .where(eq(tacotsRecommendation.surname, options.studentSurname));

  if (!user) {
    throw new NotFoundError("TACOTS Beneficiary not found");
  }

  const [newTacotsFeedback] = await db
    .insert(tacotsFeedback)
    .values({
      studentFirstName: options.studentFirstName,
      studentSurname: options.studentSurname,
      currentSchool: options.currentSchool,
      currentClass: options.currentClass,
      scholarshipHelpedStay: options.scholarshipHelpedStay,
      mostHelpfulSupport: options.mostHelpfulSupport,
      studyMotivationRating: options.studyMotivationRating,
      mentorshipImpactRating: options.mentorshipImpactRating,
      currentChallenges: options.currentChallenges,
      likedMost: options.likedMost,
      studentImprovementSuggestions: options.studentImprovementSuggestions,
      parentGuardianName: options.parentGuardianName,
      parentGuardianRelationship: options.parentGuardianRelationship,
      parentPhone: options.parentPhone,
      scholarshipReducedBurden: options.scholarshipReducedBurden,
      academicImprovementNoticed: options.academicImprovementNoticed,
      attitudeChangeNoticed: options.attitudeChangeNoticed,
      parentSatisfactionRating: options.parentSatisfactionRating,
      programImpactOnFamily: options.programImpactOnFamily,
      parentImprovementSuggestions: options.parentImprovementSuggestions,
      additionalComments: options.additionalComments,
    })
    .returning();

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:feedback:*`,
    event: "SUBMIT TACOTS FEEDBACK FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Tacots feedback form submitted successfully",
    data: newTacotsFeedback,
    meta: {
      correlationId,
    },
  };
};
export const listTacotsFeedback = async (
  page: number,
  limit: number,
  search: string,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${tacotsFeedback.studentFirstName}), 'A') ||
      setweight(to_tsvector('english', ${tacotsFeedback.studentSurname}), 'A') ||
      setweight(to_tsvector('english', ${tacotsFeedback.currentClass}), 'B') ||
      setweight(to_tsvector('english', ${tacotsFeedback.currentSchool}), 'A') ||
      setweight(to_tsvector('english', coalesce(${tacotsFeedback.parentPhone}, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsFeedback.mostHelpfulSupport}, ' '), '')), 'D') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsFeedback.currentChallenges}, ' '), '')), 'D')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [feedback, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(tacotsFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(tacotsFeedback.id) })
        .from(tacotsFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Tacots feedback found successfully",
      data: feedback,
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
  const key = `cedarrise:tacots:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots feedback found successfully",
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

  const [feedback, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(tacotsFeedback)
      .orderBy(desc(tacotsFeedback.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(tacotsFeedback.id) }).from(tacotsFeedback),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: feedback, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots feedback found successfully",
    data: feedback,
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
export const getTacotsFeedback = async (id: string) => {
  /// cache
  const key = `cedarrise:tacots:feedback:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Single feedback found successfully",
      data: cacheRes,
    };
  }
  ///

  const [feedback] = await db.select().from(tacotsFeedback).where(eq(tacotsFeedback.id, id));

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Single feedback found successfully",
    data: feedback,
  };
};
export const deleteTacotsFeedback = async (id: string, correlationId: string) => {
  await db.delete(tacotsFeedback).where(eq(tacotsFeedback.id, id));

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:feedback:*`,
    event: "DELETE TACOTS FEEDBACK RECORD",
    correlationId,
  });

  return {
    code: 200,
    message: "Tacots feedback data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportTacotsFeedbackTableToCSV = async () => {
  const data = await db.select().from(tacotsFeedback);
  return data;
};

// ONBOARDING
export const submitOnboarding = async (
  req: Request,
  options: TacotsonboardingbodyType,
  correlationId: string,
) => {
  const files = req.files as {
    parentSignature: Express.Multer.File[];
    admissionLetter: Express.Multer.File[];
  };

  const parentSignatureFile = files.parentSignature?.[0];
  const admissionLetterFile = files.admissionLetter?.[0];

  const parentSignatureUpload: UploadApiResponse | undefined | null = parentSignatureFile
    ? await uploadToCloudinary(
        parentSignatureFile,
        "/Cedarrise Initiative/TACOTS-ASSETS/SIGNATURES",
      )
    : null;

  const admissionLetterUpload: UploadApiResponse | undefined | null = admissionLetterFile
    ? await uploadToCloudinary(
        admissionLetterFile,
        "/Cedarrise Initiative/TACOTS-ASSETS/ADMISSION-LETTERS",
      )
    : null;

  const [onboarding] = await db
    .insert(tacotsOnboarding)
    .values({
      studentId: options.studentId,
      onboardingDate: sql`TO_DATE(${options.onboardingDate}, 'YYYY-MM-DD')`,
      hasMentalHealthDiagnosis: options.hasMentalHealthDiagnosis,
      diagnosedConditions: options.diagnosedConditions,
      behavioralIndicators: options.behavioralIndicators,
      focusAbilityRating: options.focusAbilityRating,
      emotionalStabilityRating: options.emotionalStabilityRating,
      peerInteractionRating: options.peerInteractionRating,
      receivedCounseling: options.receivedCounseling,
      needsSpecialSupport: options.needsSpecialSupport,
      mentalHealthNotes: options.mentalHealthNotes,
      generalHealthStatus: options.generalHealthStatus,
      immunizationStatus: options.immunizationStatus,
      hasChronicCondition: options.hasChronicCondition,
      chronicConditions: options.chronicConditions,
      allergies: options.allergies,
      requiresMedication: options.requiresMedication,
      physicalActivityLevel: options.physicalActivityLevel,
      physicalLimitations: options.physicalLimitations,
      additionalHealthNotes: options.additionalHealthNotes,
      enrolledSchoolName: options.enrolledSchoolName,
      enrolledSchoolTown: options.enrolledSchoolTown,
      enrolledSchoolLga: options.enrolledSchoolLga,
      enrolledSchoolState: options.enrolledSchoolState,
      enrolledClass: options.enrolledClass,
      termResumptionDate: sql`TO_DATE(${options.termResumptionDate}, 'YYYY-MM-DD')`,
      schoolFeesPerTerm: options.schoolFeesPerTerm,
      studentCommitment: options.studentCommitment,
      parentGuardianCommitment: options.parentGuardianCommitment,
      parentSignatureUrl: parentSignatureUpload ? parentSignatureUpload.secure_url : null,
      parentSignaturePublicId: parentSignatureUpload ? parentSignatureUpload.public_id : null,
      admissionLetterUrl: admissionLetterUpload ? admissionLetterUpload.secure_url : null,
      admissionLetterPublicId: admissionLetterUpload ? admissionLetterUpload.public_id : null,
      programOfficerNotes: options.programOfficerNotes,
      supportTypesApproved: options.supportTypesApproved,
      mentorName: options.mentorName,
      sponsorName: options.sponsorName,
      additionalInfo: options.additionalInfo,
    })
    .returning();

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:onboarding:*`,
    event: "SUBMIT TACOTS ONBOARDING FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Tacots onboarding form submitted successfully",
    data: onboarding,
    meta: {
      correlationId,
    },
  };
};
export const listOnboarding = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof onboardingSortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', concat_ws(' ', ${tacotsOnboarding.enrolledSchoolName}, ${tacotsRecommendation.firstName}, ${tacotsRecommendation.surname})), 'A') ||
      setweight(to_tsvector('english', ${tacotsOnboarding.enrolledSchoolState}), 'A') ||
      setweight(to_tsvector('english', ${tacotsOnboarding.enrolledClass}), 'C') ||
      setweight(to_tsvector('english', ${tacotsOnboarding.generalHealthStatus}), 'C') ||
      setweight(to_tsvector('english', coalesce(${tacotsOnboarding.mentorName}, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(${tacotsOnboarding.sponsorName}, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsOnboarding.diagnosedConditions}, ' '), '')), 'D') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsOnboarding.chronicConditions}, ' '), '')), 'D') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${tacotsOnboarding.supportTypesApproved}, ' '), '')), 'D') ||
      setweight(to_tsvector('english', array_to_string(${tacotsOnboarding.allergies}, ' ')), 'D') ||        
      setweight(to_tsvector('english', array_to_string(${tacotsOnboarding.behavioralIndicators}, ' ')), 'D')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [onboarded, [totalDocuments]] = await Promise.all([
      db
        .select({
          firstName: tacotsRecommendation.firstName,
          surname: tacotsRecommendation.surname,
          id: tacotsOnboarding.id,
          studentId: tacotsOnboarding.studentId,
          onboardingDate: tacotsOnboarding.onboardingDate,
          hasMentalHealthDiagnosis: tacotsOnboarding.hasMentalHealthDiagnosis,
          diagnosedConditions: tacotsOnboarding.diagnosedConditions,
          behavioralIndicators: tacotsOnboarding.behavioralIndicators,
          focusAbilityRating: tacotsOnboarding.focusAbilityRating,
          emotionalStabilityRating: tacotsOnboarding.emotionalStabilityRating,
          peerInteractionRating: tacotsOnboarding.peerInteractionRating,
          receivedCounseling: tacotsOnboarding.receivedCounseling,
          needsSpecialSupport: tacotsOnboarding.needsSpecialSupport,
          mentalHealthNotes: tacotsOnboarding.mentalHealthNotes,
          generalHealthStatus: tacotsOnboarding.generalHealthStatus,
          immunizationStatus: tacotsOnboarding.immunizationStatus,
          hasChronicCondition: tacotsOnboarding.hasChronicCondition,
          chronicConditions: tacotsOnboarding.chronicConditions,
          allergies: tacotsOnboarding.allergies,
          requiresMedication: tacotsOnboarding.requiresMedication,
          physicalActivityLevel: tacotsOnboarding.physicalActivityLevel,
          physicalLimitations: tacotsOnboarding.physicalLimitations,
          additionalHealthNotes: tacotsOnboarding.additionalHealthNotes,
          enrolledSchoolName: tacotsOnboarding.enrolledSchoolName,
          enrolledSchoolTown: tacotsOnboarding.enrolledSchoolTown,
          enrolledSchoolLga: tacotsOnboarding.enrolledSchoolLga,
          enrolledSchoolState: tacotsOnboarding.enrolledSchoolState,
          enrolledClass: tacotsOnboarding.enrolledClass,
          termResumptionDate: tacotsOnboarding.termResumptionDate,
          schoolFeesPerTerm: tacotsOnboarding.schoolFeesPerTerm,
          studentCommitment: tacotsOnboarding.studentCommitment,
          parentGuardianCommitment: tacotsOnboarding.parentGuardianCommitment,
          parentSignatureUrl: tacotsOnboarding.parentSignatureUrl,
          parentSignaturePublicId: tacotsOnboarding.parentSignaturePublicId,
          admissionLetterUrl: tacotsOnboarding.admissionLetterUrl,
          admissionLetterPublicId: tacotsOnboarding.admissionLetterPublicId,
          programOfficerNotes: tacotsOnboarding.programOfficerNotes,
          supportTypesApproved: tacotsOnboarding.supportTypesApproved,
          mentorName: tacotsOnboarding.mentorName,
          sponsorName: tacotsOnboarding.sponsorName,
          additionalInfo: tacotsOnboarding.additionalInfo,
          updatedAt: tacotsOnboarding.updatedAt,
          createdAt: tacotsOnboarding.updatedAt,
          deletedAt: tacotsOnboarding.deletedAt,
        })
        .from(tacotsOnboarding)
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(tacotsOnboarding.id) })
        .from(tacotsOnboarding)
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Tacots onboarded beneficiaries found successfully",
      data: onboarded,
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
  const key = `cedarrise:tacots:onboarding:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots onboarded beneficiaries found successfully",
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
  const sortColumn = onboardingSortMap[sortBy] ?? tacotsOnboarding.createdAt;
  const orderby =
    sortColumn === tacotsOnboarding.createdAt
      ? [desc(tacotsOnboarding.createdAt)]
      : [sortDirection(sortColumn), desc(tacotsOnboarding.createdAt)];
  const [onboarded, [totalDocuments]] = await Promise.all([
    db
      .select({
        firstName: tacotsRecommendation.firstName,
        surname: tacotsRecommendation.surname,
        id: tacotsOnboarding.id,
        studentId: tacotsOnboarding.studentId,
        onboardingDate: tacotsOnboarding.onboardingDate,
        hasMentalHealthDiagnosis: tacotsOnboarding.hasMentalHealthDiagnosis,
        diagnosedConditions: tacotsOnboarding.diagnosedConditions,
        behavioralIndicators: tacotsOnboarding.behavioralIndicators,
        focusAbilityRating: tacotsOnboarding.focusAbilityRating,
        emotionalStabilityRating: tacotsOnboarding.emotionalStabilityRating,
        peerInteractionRating: tacotsOnboarding.peerInteractionRating,
        receivedCounseling: tacotsOnboarding.receivedCounseling,
        needsSpecialSupport: tacotsOnboarding.needsSpecialSupport,
        mentalHealthNotes: tacotsOnboarding.mentalHealthNotes,
        generalHealthStatus: tacotsOnboarding.generalHealthStatus,
        immunizationStatus: tacotsOnboarding.immunizationStatus,
        hasChronicCondition: tacotsOnboarding.hasChronicCondition,
        chronicConditions: tacotsOnboarding.chronicConditions,
        allergies: tacotsOnboarding.allergies,
        requiresMedication: tacotsOnboarding.requiresMedication,
        physicalActivityLevel: tacotsOnboarding.physicalActivityLevel,
        physicalLimitations: tacotsOnboarding.physicalLimitations,
        additionalHealthNotes: tacotsOnboarding.additionalHealthNotes,
        enrolledSchoolName: tacotsOnboarding.enrolledSchoolName,
        enrolledSchoolTown: tacotsOnboarding.enrolledSchoolTown,
        enrolledSchoolLga: tacotsOnboarding.enrolledSchoolLga,
        enrolledSchoolState: tacotsOnboarding.enrolledSchoolState,
        enrolledClass: tacotsOnboarding.enrolledClass,
        termResumptionDate: tacotsOnboarding.termResumptionDate,
        schoolFeesPerTerm: tacotsOnboarding.schoolFeesPerTerm,
        studentCommitment: tacotsOnboarding.studentCommitment,
        parentGuardianCommitment: tacotsOnboarding.parentGuardianCommitment,
        parentSignatureUrl: tacotsOnboarding.parentSignatureUrl,
        parentSignaturePublicId: tacotsOnboarding.parentSignaturePublicId,
        admissionLetterUrl: tacotsOnboarding.admissionLetterUrl,
        admissionLetterPublicId: tacotsOnboarding.admissionLetterPublicId,
        programOfficerNotes: tacotsOnboarding.programOfficerNotes,
        supportTypesApproved: tacotsOnboarding.supportTypesApproved,
        mentorName: tacotsOnboarding.mentorName,
        sponsorName: tacotsOnboarding.sponsorName,
        additionalInfo: tacotsOnboarding.additionalInfo,
        updatedAt: tacotsOnboarding.updatedAt,
        createdAt: tacotsOnboarding.updatedAt,
        deletedAt: tacotsOnboarding.deletedAt,
      })
      .from(tacotsOnboarding)
      .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(tacotsOnboarding.id) }).from(tacotsOnboarding),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: onboarded, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots onboarded beneficiaries found successfully",
    data: onboarded,
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
export const getOnboarding = async (id: string) => {
  /// cache
  const key = `cedarrise:tacots:onboarding:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots onboarding data found successfully",
      data: cacheRes,
    };
  }
  ///

  const [onboarding] = await db
    .select({
      firstName: tacotsRecommendation.firstName,
      surname: tacotsRecommendation.surname,
      id: tacotsOnboarding.id,
      studentId: tacotsOnboarding.studentId,
      onboardingDate: tacotsOnboarding.onboardingDate,
      hasMentalHealthDiagnosis: tacotsOnboarding.hasMentalHealthDiagnosis,
      diagnosedConditions: tacotsOnboarding.diagnosedConditions,
      behavioralIndicators: tacotsOnboarding.behavioralIndicators,
      focusAbilityRating: tacotsOnboarding.focusAbilityRating,
      emotionalStabilityRating: tacotsOnboarding.emotionalStabilityRating,
      peerInteractionRating: tacotsOnboarding.peerInteractionRating,
      receivedCounseling: tacotsOnboarding.receivedCounseling,
      needsSpecialSupport: tacotsOnboarding.needsSpecialSupport,
      mentalHealthNotes: tacotsOnboarding.mentalHealthNotes,
      generalHealthStatus: tacotsOnboarding.generalHealthStatus,
      immunizationStatus: tacotsOnboarding.immunizationStatus,
      hasChronicCondition: tacotsOnboarding.hasChronicCondition,
      chronicConditions: tacotsOnboarding.chronicConditions,
      allergies: tacotsOnboarding.allergies,
      requiresMedication: tacotsOnboarding.requiresMedication,
      physicalActivityLevel: tacotsOnboarding.physicalActivityLevel,
      physicalLimitations: tacotsOnboarding.physicalLimitations,
      additionalHealthNotes: tacotsOnboarding.additionalHealthNotes,
      enrolledSchoolName: tacotsOnboarding.enrolledSchoolName,
      enrolledSchoolTown: tacotsOnboarding.enrolledSchoolTown,
      enrolledSchoolLga: tacotsOnboarding.enrolledSchoolLga,
      enrolledSchoolState: tacotsOnboarding.enrolledSchoolState,
      enrolledClass: tacotsOnboarding.enrolledClass,
      termResumptionDate: tacotsOnboarding.termResumptionDate,
      schoolFeesPerTerm: tacotsOnboarding.schoolFeesPerTerm,
      studentCommitment: tacotsOnboarding.studentCommitment,
      parentGuardianCommitment: tacotsOnboarding.parentGuardianCommitment,
      parentSignatureUrl: tacotsOnboarding.parentSignatureUrl,
      parentSignaturePublicId: tacotsOnboarding.parentSignaturePublicId,
      admissionLetterUrl: tacotsOnboarding.admissionLetterUrl,
      admissionLetterPublicId: tacotsOnboarding.admissionLetterPublicId,
      programOfficerNotes: tacotsOnboarding.programOfficerNotes,
      supportTypesApproved: tacotsOnboarding.supportTypesApproved,
      mentorName: tacotsOnboarding.mentorName,
      sponsorName: tacotsOnboarding.sponsorName,
      additionalInfo: tacotsOnboarding.additionalInfo,
      updatedAt: tacotsOnboarding.updatedAt,
      createdAt: tacotsOnboarding.updatedAt,
      deletedAt: tacotsOnboarding.deletedAt,
    })
    .from(tacotsOnboarding)
    .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
    .where(eq(tacotsOnboarding.id, id));

  /// cache set
  await cacheSet(key, onboarding, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots onboarding data found successfully",
    data: onboarding,
  };
};
export const deleteOnboarding = async (id: string, correlationId: string) => {
  const [data] = await db.delete(tacotsOnboarding).where(eq(tacotsOnboarding.id, id)).returning({
    parentSignaturePublicId: tacotsOnboarding.parentSignaturePublicId,
    admissionLetterPublicId: tacotsOnboarding.admissionLetterPublicId,
  });

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:onboarding:*`,
    event: "DELETE TACOTS ONBOARDING RECORD",
    correlationId,
  });

  if (data?.parentSignaturePublicId) {
    try {
      await addAssetToDeletionQueue(data.parentSignaturePublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add parent signature public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.admissionLetterPublicId) {
    try {
      await addAssetToDeletionQueue(data.admissionLetterPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add admission letter public id to queue`, {
        user: id,
      });
    }
  }

  return {
    code: 200,
    message: "Tacots onboarding data deleted successfully",
    meta: {
      correlationId,
    },
  };
};
export const exportTacotsOnboardingTableToCSV = async () => {
  const data = await db.select().from(tacotsOnboarding);
  return data;
};

// TACOTS TRACKERS CARDS DATA
export const getTacotsTrackersCardsData = async () => {
  /// cache
  const key = "cedarrise:tacotstrackercardsdata";
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return cacheRes;
  }
  ///

  const currentYear = new Date().getFullYear();

  const [
    [totalTacotsRecommendations],
    [totalTacotsTracking],
    [totalTacotsOnboarding],
    [totalTacotsExit],
    [highRiskBeneficiaries],
    [totalCompletedExitRecords],
  ] = await Promise.all([
    //totalRecords
    db.select({ value: count(tacotsRecommendation.id) }).from(tacotsRecommendation),
    db.select({ value: count(tacotsTracking.id) }).from(tacotsTracking),
    db.select({ value: count(tacotsOnboarding.id) }).from(tacotsOnboarding),
    db.select({ value: count(tacotsExit.id) }).from(tacotsExit),
    // highRiskStudents
    db
      .select({
        value: countDistinct(tacotsTracking.studentId),
      })
      .from(tacotsTracking)
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${tacotsTracking.createdAt}) = ${currentYear}`,
          lt(tacotsTracking.studentAveragePct, 50),
        ),
      ),
    // completed
    db
      .select({ value: countDistinct(tacotsExit.studentId) })
      .from(tacotsExit)
      .where(inArray(tacotsExit.exitReason, ["COMPLETED SECONDARY EDUCATION (GRADUATED)"])),
  ]);

  /// cache set
  await cacheSet(
    key,
    {
      totalRecords:
        Number(totalTacotsTracking?.value ?? 0) +
        Number(totalTacotsOnboarding?.value ?? 0) +
        Number(totalTacotsExit?.value ?? 0),
      highRiskStudents: Number(highRiskBeneficiaries?.value ?? 0),
      onboardingRate: Number(
        ((totalTacotsOnboarding?.value ?? 0) / (totalTacotsRecommendations?.value ?? 0)) * 100,
      ),
      completed: Number(totalCompletedExitRecords?.value ?? 0),
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );

  return {
    totalRecords:
      Number(totalTacotsTracking?.value ?? 0) +
      Number(totalTacotsOnboarding?.value ?? 0) +
      Number(totalTacotsExit?.value ?? 0),
    highRiskStudents: Number(highRiskBeneficiaries?.value ?? 0),
    onboardingRate: Number(
      ((totalTacotsOnboarding?.value ?? 0) / (totalTacotsRecommendations?.value ?? 0)) * 100,
    ),
    completed: Number(totalCompletedExitRecords?.value ?? 0),
  };
};

// TRACKING
export const submitTacotsTracking = async (
  req: Request,
  options: TacotstrackingbodyType,
  correlationId: string,
) => {
  const files = req.files as {
    termResult: Express.Multer.File[];
    paymentEvidence: Express.Multer.File[];
  };

  const termResultFile = files.termResult?.[0];
  const paymentEvidenceFile = files.paymentEvidence?.[0];

  const termResultUpload: UploadApiResponse | undefined | null = termResultFile
    ? await uploadToCloudinary(termResultFile, "/Cedarrise Initiative/TACOTS-ASSETS/TERM-RESULTS")
    : null;

  const paymentEvidenceUpload: UploadApiResponse | undefined | null = paymentEvidenceFile
    ? await uploadToCloudinary(
        paymentEvidenceFile,
        "/Cedarrise Initiative/TACOTS-ASSETS/PAYMENT-EVIDENCE",
      )
    : null;

  if (!termResultUpload) {
    throw new Error(`Could not upload term result`);
  }

  const [tracking] = await db
    .insert(tacotsTracking)
    .values({
      studentId: options.studentId,
      schoolId: options.schoolId,
      region: options.region,
      academicSession: options.academicSession,
      academicTerm: options.academicTerm,
      assessmentPeriod: options.assessmentPeriod,
      submissionDate: sql`TO_DATE(${options.submissionDate}, 'YYYY-MM-DD')`,
      highestSubjectScore: options.highestSubjectScore,
      lowestSubjectScore: options.lowestSubjectScore,
      studentAveragePct: options.studentAveragePct,
      studentPositionInClass: options.studentPositionInClass,
      academicComment: options.academicComment,
      socialBehaviorRating: options.socialBehaviorRating,
      schoolRulesRating: options.schoolRulesRating,
      responsibilityRating: options.responsibilityRating,
      formationComments: options.formationComments,
      mentorName: options.mentorName,
      mentorshipSessionDate: sql`TO_DATE(${options.mentorshipSessionDate}, 'YYYY-MM-DD')`,
      mentorshipMode: options.mentorshipMode,
      mentorshipDuration: options.mentorshipDuration,
      mentorshipNotes: options.mentorshipNotes,
      serviceActivityType: options.serviceActivityType,
      serviceDate: sql`TO_DATE(${options.serviceDate}, 'YYYY-MM-DD')`,
      serviceDuration: options.serviceDuration,
      serviceDescription: options.serviceDescription,
      serviceSupervisor: options.serviceSupervisor,
      tuitionFeePaid: options.tuitionFeePaid,
      resourcesSpent: options.resourcesSpent,
      sundriesSpent: options.sundriesSpent,
      totalAmountSpent: options.totalAmountSpent,
      financialNotes: options.financialNotes,
      termResultUrl: termResultUpload ? termResultUpload.secure_url : "",
      termResultPublicId: termResultUpload ? termResultUpload.public_id : "",
      paymentEvidenceUrl: paymentEvidenceUpload ? paymentEvidenceUpload.secure_url : null,
      paymentEvidencePublicId: paymentEvidenceUpload ? paymentEvidenceUpload.public_id : null,
    })
    .returning();

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:tracking:*`,
    event: "SUBMIT TACOTS TRACKING FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "Tacots tracking form submitted successfully",
    data: tracking,
    meta: { correlationId },
  };
};
export const listTacotsTracking = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof trackingSortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', concat_ws(' ', ${tacotsTracking.academicTerm}, ${tacotsRecommendation.firstName}, ${tacotsRecommendation.surname})), 'A') ||
      setweight(to_tsvector('english', ${tacotsTracking.assessmentPeriod}), 'A') ||
      setweight(to_tsvector('english', ${tacotsTracking.region}), 'B') ||
      setweight(to_tsvector('english', ${tacotsTracking.mentorName}), 'B') 
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [trackingData, [totalDocuments]] = await Promise.all([
      db
        .select({
          firstName: tacotsRecommendation.firstName,
          surname: tacotsRecommendation.surname,
          id: tacotsTracking.id,
          studentId: tacotsTracking.studentId,
          schoolId: tacotsTracking.schoolId,
          schoolName: tacotsRecommendation.schoolName,
          region: tacotsTracking.region,
          academicSession: tacotsTracking.academicSession,
          academicTerm: tacotsTracking.academicTerm,
          assessmentPeriod: tacotsTracking.assessmentPeriod,
          submissionDate: tacotsTracking.submissionDate,
          highestSubjectScore: tacotsTracking.highestSubjectScore,
          lowestSubjectScore: tacotsTracking.lowestSubjectScore,
          studentAveragePct: tacotsTracking.studentAveragePct,
          studentPositionInClass: tacotsTracking.studentPositionInClass,
          academicComment: tacotsTracking.academicComment,
          socialBehaviorRating: tacotsTracking.socialBehaviorRating,
          schoolRulesRating: tacotsTracking.schoolRulesRating,
          responsibilityRating: tacotsTracking.responsibilityRating,
          formationComments: tacotsTracking.formationComments,
          mentorName: tacotsTracking.mentorName,
          mentorshipSessionDate: tacotsTracking.mentorshipSessionDate,
          mentorshipMode: tacotsTracking.mentorshipMode,
          mentorshipDuration: tacotsTracking.mentorshipDuration,
          mentorshipNotes: tacotsTracking.mentorshipNotes,
          serviceActivityType: tacotsTracking.serviceActivityType,
          serviceDate: tacotsTracking.serviceDate,
          serviceDuration: tacotsTracking.serviceDuration,
          serviceDescription: tacotsTracking.serviceDescription,
          serviceSupervisor: tacotsTracking.serviceSupervisor,
          tuitionFeePaid: tacotsTracking.tuitionFeePaid,
          resourcesSpent: tacotsTracking.resourcesSpent,
          sundriesSpent: tacotsTracking.sundriesSpent,
          totalAmountSpent: tacotsTracking.totalAmountSpent,
          financialNotes: tacotsTracking.financialNotes,
          termResultUrl: tacotsTracking.termResultUrl,
          termResultPublicId: tacotsTracking.termResultPublicId,
          paymentEvidenceUrl: tacotsTracking.paymentEvidenceUrl,
          paymentEvidencePublicId: tacotsTracking.paymentEvidencePublicId,
        })
        .from(tacotsTracking)
        .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsTracking.studentId))
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(tacotsTracking.id) })
        .from(tacotsTracking)
        .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsTracking.studentId))
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    const tracking = trackingData.map((t) => {
      return {
        firstName: t.firstName,
        surname: t.surname,
        id: t.id,
        studentId: t.studentId,
        schoolId: t.schoolId,
        schoolName: t.schoolName,
        region: t.region,
        academicSession: t.academicSession,
        academicTerm: t.academicTerm,
        assessmentPeriod: t.assessmentPeriod,
        submissionDate: t.submissionDate,
        highestSubjectScore: t.highestSubjectScore,
        lowestSubjectScore: t.lowestSubjectScore,
        studentAveragePct: t.studentAveragePct,
        studentPositionInClass: t.studentPositionInClass,
        academicComment: t.academicComment,
        socialBehaviorRating: t.socialBehaviorRating,
        schoolRulesRating: t.schoolRulesRating,
        responsibilityRating: t.responsibilityRating,
        formationComments: t.formationComments,
        mentorName: t.mentorName,
        mentorshipSessionDate: t.mentorshipSessionDate,
        mentorshipMode: t.mentorshipMode,
        mentorshipDuration: t.mentorshipDuration,
        mentorshipNotes: t.mentorshipNotes,
        serviceActivityType: t.serviceActivityType,
        serviceDate: t.serviceDate,
        serviceDuration: t.serviceDuration,
        serviceDescription: t.serviceDescription,
        serviceSupervisor: t.serviceSupervisor,
        tuitionFeePaid: t.tuitionFeePaid.toLocaleString("en-US", {
          style: "currency",
          currency: "NGN",
        }),
        resourcesSpent: t.resourcesSpent.toLocaleString("en-US", {
          style: "currency",
          currency: "NGN",
        }),
        sundriesSpent: t.sundriesSpent.toLocaleString("en-US", {
          style: "currency",
          currency: "NGN",
        }),
        totalAmountSpent: t.totalAmountSpent.toLocaleString("en-US", {
          style: "currency",
          currency: "NGN",
        }),
        financialNotes: t.financialNotes,
        termResultUrl: t.termResultUrl,
        termResultPublicId: t.termResultPublicId,
        paymentEvidenceUrl: t.paymentEvidenceUrl,
        paymentEvidencePublicId: t.paymentEvidencePublicId,
      };
    });

    return {
      code: 200,
      message: "All Tacots tracking data found successfully",
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
  const key = `cedarrise:tacots:tracking:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "All Tacots tracking data found successfully",
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
  const sortColumn = trackingSortMap[sortBy] ?? tacotsTracking.createdAt;
  const orderby =
    sortColumn === tacotsTracking.createdAt
      ? [desc(tacotsTracking.createdAt)]
      : [sortDirection(sortColumn), desc(tacotsTracking.createdAt)];

  const [trackingData, [totalDocuments], metaData] = await Promise.all([
    db
      .select({
        firstName: tacotsRecommendation.firstName,
        surname: tacotsRecommendation.surname,
        id: tacotsTracking.id,
        studentId: tacotsTracking.studentId,
        schoolId: tacotsTracking.schoolId,
        schoolName: tacotsRecommendation.schoolName,
        region: tacotsTracking.region,
        academicSession: tacotsTracking.academicSession,
        academicTerm: tacotsTracking.academicTerm,
        assessmentPeriod: tacotsTracking.assessmentPeriod,
        submissionDate: tacotsTracking.submissionDate,
        highestSubjectScore: tacotsTracking.highestSubjectScore,
        lowestSubjectScore: tacotsTracking.lowestSubjectScore,
        studentAveragePct: tacotsTracking.studentAveragePct,
        studentPositionInClass: tacotsTracking.studentPositionInClass,
        academicComment: tacotsTracking.academicComment,
        socialBehaviorRating: tacotsTracking.socialBehaviorRating,
        schoolRulesRating: tacotsTracking.schoolRulesRating,
        responsibilityRating: tacotsTracking.responsibilityRating,
        formationComments: tacotsTracking.formationComments,
        mentorName: tacotsTracking.mentorName,
        mentorshipSessionDate: tacotsTracking.mentorshipSessionDate,
        mentorshipMode: tacotsTracking.mentorshipMode,
        mentorshipDuration: tacotsTracking.mentorshipDuration,
        mentorshipNotes: tacotsTracking.mentorshipNotes,
        serviceActivityType: tacotsTracking.serviceActivityType,
        serviceDate: tacotsTracking.serviceDate,
        serviceDuration: tacotsTracking.serviceDuration,
        serviceDescription: tacotsTracking.serviceDescription,
        serviceSupervisor: tacotsTracking.serviceSupervisor,
        tuitionFeePaid: tacotsTracking.tuitionFeePaid,
        resourcesSpent: tacotsTracking.resourcesSpent,
        sundriesSpent: tacotsTracking.sundriesSpent,
        totalAmountSpent: tacotsTracking.totalAmountSpent,
        financialNotes: tacotsTracking.financialNotes,
        termResultUrl: tacotsTracking.termResultUrl,
        termResultPublicId: tacotsTracking.termResultPublicId,
        paymentEvidenceUrl: tacotsTracking.paymentEvidenceUrl,
        paymentEvidencePublicId: tacotsTracking.paymentEvidencePublicId,
      })
      .from(tacotsTracking)
      .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsTracking.studentId))
      .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(tacotsTracking.id) }).from(tacotsTracking),
    getTacotsTrackersCardsData(),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  const tracking = trackingData.map((t) => {
    return {
      firstName: t.firstName,
      surname: t.surname,
      id: t.id,
      studentId: t.studentId,
      schoolName: t.schoolName,
      schoolId: t.schoolId,
      region: t.region,
      academicSession: t.academicSession,
      academicTerm: t.academicTerm,
      assessmentPeriod: t.assessmentPeriod,
      submissionDate: t.submissionDate,
      highestSubjectScore: t.highestSubjectScore,
      lowestSubjectScore: t.lowestSubjectScore,
      studentAveragePct: t.studentAveragePct,
      studentPositionInClass: t.studentPositionInClass,
      academicComment: t.academicComment,
      socialBehaviorRating: t.socialBehaviorRating,
      schoolRulesRating: t.schoolRulesRating,
      responsibilityRating: t.responsibilityRating,
      formationComments: t.formationComments,
      mentorName: t.mentorName,
      mentorshipSessionDate: t.mentorshipSessionDate,
      mentorshipMode: t.mentorshipMode,
      mentorshipDuration: t.mentorshipDuration,
      mentorshipNotes: t.mentorshipNotes,
      serviceActivityType: t.serviceActivityType,
      serviceDate: t.serviceDate,
      serviceDuration: t.serviceDuration,
      serviceDescription: t.serviceDescription,
      serviceSupervisor: t.serviceSupervisor,
      tuitionFeePaid: t.tuitionFeePaid.toLocaleString("en-US", {
        style: "currency",
        currency: "NGN",
      }),
      resourcesSpent: t.resourcesSpent.toLocaleString("en-US", {
        style: "currency",
        currency: "NGN",
      }),
      sundriesSpent: t.sundriesSpent.toLocaleString("en-US", {
        style: "currency",
        currency: "NGN",
      }),
      totalAmountSpent: t.totalAmountSpent.toLocaleString("en-US", {
        style: "currency",
        currency: "NGN",
      }),
      financialNotes: t.financialNotes,
      termResultUrl: t.termResultUrl,
      termResultPublicId: t.termResultPublicId,
      paymentEvidenceUrl: t.paymentEvidenceUrl,
      paymentEvidencePublicId: t.paymentEvidencePublicId,
    };
  });

  /// cache set
  await cacheSet(key, { data: tracking, totalPages, metadata: metaData }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "All Tacots tracking data found successfully",
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
export const getTacotsTracking = async (id: string) => {
  /// cache
  const key = `cedarrise:tacots:tracking:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots tracking data found successfully",
      data: cacheRes,
    };
  }
  ///

  const [trackingData] = await db
    .select({
      firstName: tacotsRecommendation.firstName,
      surname: tacotsRecommendation.surname,
      id: tacotsTracking.id,
      schoolName: tacotsRecommendation.schoolName,
      // schoolId: tacotsTracking.schoolId,
      region: tacotsTracking.region,
      academicSession: tacotsTracking.academicSession,
      academicTerm: tacotsTracking.academicTerm,
      assessmentPeriod: tacotsTracking.assessmentPeriod,
      submissionDate: tacotsTracking.submissionDate,
      highestSubjectScore: tacotsTracking.highestSubjectScore,
      lowestSubjectScore: tacotsTracking.lowestSubjectScore,
      studentAveragePct: tacotsTracking.studentAveragePct,
      studentPositionInClass: tacotsTracking.studentPositionInClass,
      academicComment: tacotsTracking.academicComment,
      socialBehaviorRating: tacotsTracking.socialBehaviorRating,
      schoolRulesRating: tacotsTracking.schoolRulesRating,
      responsibilityRating: tacotsTracking.responsibilityRating,
      formationComments: tacotsTracking.formationComments,
      mentorName: tacotsTracking.mentorName,
      mentorshipSessionDate: tacotsTracking.mentorshipSessionDate,
      mentorshipMode: tacotsTracking.mentorshipMode,
      mentorshipDuration: tacotsTracking.mentorshipDuration,
      mentorshipNotes: tacotsTracking.mentorshipNotes,
      serviceActivityType: tacotsTracking.serviceActivityType,
      serviceDate: tacotsTracking.serviceDate,
      serviceDuration: tacotsTracking.serviceDuration,
      serviceDescription: tacotsTracking.serviceDescription,
      serviceSupervisor: tacotsTracking.serviceSupervisor,
      tuitionFeePaid: tacotsTracking.tuitionFeePaid,
      resourcesSpent: tacotsTracking.resourcesSpent,
      sundriesSpent: tacotsTracking.sundriesSpent,
      totalAmountSpent: tacotsTracking.totalAmountSpent,
      financialNotes: tacotsTracking.financialNotes,
      termResultUrl: tacotsTracking.termResultUrl,
      termResultPublicId: tacotsTracking.termResultPublicId,
      paymentEvidenceUrl: tacotsTracking.paymentEvidenceUrl,
      paymentEvidencePublicId: tacotsTracking.paymentEvidencePublicId,
    })
    .from(tacotsTracking)
    .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsTracking.studentId))
    .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
    .where(eq(tacotsTracking.id, id));

  const tracking = {
    firstName: trackingData?.firstName,
    surname: trackingData?.surname,
    id: trackingData?.id,
    schoolName: trackingData?.schoolName,
    // schoolId: trackingData?.schoolId,
    region: trackingData?.region,
    academicSession: trackingData?.academicSession,
    academicTerm: trackingData?.academicTerm,
    assessmentPeriod: trackingData?.assessmentPeriod,
    submissionDate: trackingData?.submissionDate,
    highestSubjectScore: trackingData?.highestSubjectScore,
    lowestSubjectScore: trackingData?.lowestSubjectScore,
    studentAveragePct: trackingData?.studentAveragePct,
    studentPositionInClass: trackingData?.studentPositionInClass,
    academicComment: trackingData?.academicComment,
    socialBehaviorRating: trackingData?.socialBehaviorRating,
    schoolRulesRating: trackingData?.schoolRulesRating,
    responsibilityRating: trackingData?.responsibilityRating,
    formationComments: trackingData?.formationComments,
    mentorName: trackingData?.mentorName,
    mentorshipSessionDate: trackingData?.mentorshipSessionDate,
    mentorshipMode: trackingData?.mentorshipMode,
    mentorshipDuration: trackingData?.mentorshipDuration,
    mentorshipNotes: trackingData?.mentorshipNotes,
    serviceActivityType: trackingData?.serviceActivityType,
    serviceDate: trackingData?.serviceDate,
    serviceDuration: trackingData?.serviceDuration,
    serviceDescription: trackingData?.serviceDescription,
    serviceSupervisor: trackingData?.serviceSupervisor,
    tuitionFeePaid: trackingData?.tuitionFeePaid.toLocaleString("en-US", {
      style: "currency",
      currency: "NGN",
    }),
    resourcesSpent: trackingData?.resourcesSpent.toLocaleString("en-US", {
      style: "currency",
      currency: "NGN",
    }),
    sundriesSpent: trackingData?.sundriesSpent.toLocaleString("en-US", {
      style: "currency",
      currency: "NGN",
    }),
    totalAmountSpent: trackingData?.totalAmountSpent.toLocaleString("en-US", {
      style: "currency",
      currency: "NGN",
    }),
    financialNotes: trackingData?.financialNotes,
    termResultUrl: trackingData?.termResultUrl,
    termResultPublicId: trackingData?.termResultPublicId,
    paymentEvidenceUrl: trackingData?.paymentEvidenceUrl,
    paymentEvidencePublicId: trackingData?.paymentEvidencePublicId,
  };

  /// cache set
  await cacheSet(key, tracking, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots tracking data found successfully",
    data: tracking,
  };
};
export const deleteTacotsTracking = async (id: string, correlationId: string) => {
  const [data] = await db.delete(tacotsTracking).where(eq(tacotsTracking.id, id)).returning({
    termResultPublicId: tacotsTracking.termResultPublicId,
    paymentEvidencePublicId: tacotsTracking.paymentEvidencePublicId,
  });

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:tracking:*`,
    event: "DELETE TACOTS TRACKING RECORD",
    correlationId,
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

  if (data?.paymentEvidencePublicId) {
    try {
      await addAssetToDeletionQueue(data.paymentEvidencePublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add payment evidence public id to queue`, {
        user: id,
      });
    }
  }

  return {
    code: 200,
    message: "Tacots tracking data deleted successfully",
    meta: { correlationId },
  };
};
export const exportTacotsTrackingTableToCSV = async () => {
  const data = await db.select().from(tacotsTracking);
  return data;
};

// EXIT
export const submitTacotsExit = async (options: TacotsexitbodyType, correlationId: string) => {
  const [exit] = await db
    .insert(tacotsExit)
    .values({
      studentId: options.studentId,
      schoolAttendedDuringProgram: options.schoolAttendedDuringProgram,
      yearOfExit: options.yearOfExit,
      exitReason: options.exitReason,
      highestEducationAttained: options.highestEducationAttained,
      currentStatus: options.currentStatus,
      higherInstitutionName: options.higherInstitutionName,
      higherInstitutionCity: options.higherInstitutionCity,
      higherInstitutionState: options.higherInstitutionState,
      employmentType: options.employmentType,
      vocationalSkill: options.vocationalSkill,
      newSchoolName: options.newSchoolName,
      completedSecondaryElsewhere: options.completedSecondaryElsewhere,
      programImpactDescription: options.programImpactDescription,
      programImpactRating: options.programImpactRating,
      additionalSituationInfo: options.additionalSituationInfo,
      completedBy: options.completedBy,
      submissionDate: sql`TO_DATE(${options.submissionDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:exit:*`,
    event: "SUBMIT TACOTS EXIT FORM",
    correlationId,
  });

  return {
    code: 201,
    message: "TACOTS exit form submitted successfully",
    data: exit,
    meta: {
      correlationId,
    },
  };
};
export const listTacotsExit = async (
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
      setweight(to_tsvector('english', concat_ws(' ', ${tacotsExit.schoolAttendedDuringProgram}, ${tacotsRecommendation.firstName}, ${tacotsRecommendation.surname})), 'A') ||
      setweight(to_tsvector('english', ${tacotsExit.exitReason}), 'C') ||
      setweight(to_tsvector('english', ${tacotsExit.currentStatus}), 'C') ||
      setweight(to_tsvector('english', ${tacotsExit.completedBy}), 'C') 
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [exit, [totalDocuments]] = await Promise.all([
      db
        .select({
          firstName: tacotsRecommendation.firstName,
          surname: tacotsRecommendation.surname,
          id: tacotsExit.id,
          studentId: tacotsExit.studentId,
          schoolAttendedDuringProgram: tacotsExit.schoolAttendedDuringProgram,
          yearOfExit: tacotsExit.yearOfExit,
          exitReason: tacotsExit.exitReason,
          highestEducationAttained: tacotsExit.highestEducationAttained,
          currentStatus: tacotsExit.currentStatus,
          higherInstitutionName: tacotsExit.higherInstitutionName,
          higherInstitutionCity: tacotsExit.higherInstitutionCity,
          higherInstitutionState: tacotsExit.higherInstitutionState,
          employmentType: tacotsExit.employmentType,
          vocationalSkill: tacotsExit.vocationalSkill,
          newSchoolName: tacotsExit.newSchoolName,
          completedSecondaryElsewhere: tacotsExit.completedSecondaryElsewhere,
          programImpactDescription: tacotsExit.programImpactDescription,
          programImpactRating: tacotsExit.programImpactRating,
          additionalSituationInfo: tacotsExit.additionalSituationInfo,
          completedBy: tacotsExit.completedBy,
          submissionDate: tacotsExit.submissionDate,
          updatedAt: tacotsExit.updatedAt,
          createdAt: tacotsExit.createdAt,
          deletedAt: tacotsExit.deletedAt,
        })
        .from(tacotsExit)
        .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsExit.studentId))
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(tacotsExit.id) })
        .from(tacotsExit)
        .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsExit.studentId))
        .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "All Tacots exit data found successfully",
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
  const key = `cedarrise:tacots:exit:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "All Tacots exit data found successfully",
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
  const sortColumn = exitSortMap[sortBy] ?? tacotsExit.createdAt;
  const orderby =
    sortColumn === tacotsExit.createdAt
      ? [desc(tacotsExit.createdAt)]
      : [sortDirection(sortColumn), desc(tacotsExit.createdAt)];
  const [exit, [totalDocuments]] = await Promise.all([
    db
      .select({
        firstName: tacotsRecommendation.firstName,
        surname: tacotsRecommendation.surname,
        id: tacotsExit.id,
        studentId: tacotsExit.studentId,
        schoolAttendedDuringProgram: tacotsExit.schoolAttendedDuringProgram,
        yearOfExit: tacotsExit.yearOfExit,
        exitReason: tacotsExit.exitReason,
        highestEducationAttained: tacotsExit.highestEducationAttained,
        currentStatus: tacotsExit.currentStatus,
        higherInstitutionName: tacotsExit.higherInstitutionName,
        higherInstitutionCity: tacotsExit.higherInstitutionCity,
        higherInstitutionState: tacotsExit.higherInstitutionState,
        employmentType: tacotsExit.employmentType,
        vocationalSkill: tacotsExit.vocationalSkill,
        newSchoolName: tacotsExit.newSchoolName,
        completedSecondaryElsewhere: tacotsExit.completedSecondaryElsewhere,
        programImpactDescription: tacotsExit.programImpactDescription,
        programImpactRating: tacotsExit.programImpactRating,
        additionalSituationInfo: tacotsExit.additionalSituationInfo,
        completedBy: tacotsExit.completedBy,
        submissionDate: tacotsExit.submissionDate,
        updatedAt: tacotsExit.updatedAt,
        createdAt: tacotsExit.createdAt,
        deletedAt: tacotsExit.deletedAt,
      })
      .from(tacotsExit)
      .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsExit.studentId))
      .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(tacotsExit.id) }).from(tacotsExit),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);
  /// cache set
  await cacheSet(key, { data: exit, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "All Tacots exit data found successfully",
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
export const getTacotsExit = async (id: string) => {
  /// cache
  const key = `cedarrise:tacots:exit:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots tracking data found successfully",
      data: cacheRes,
    };
  }
  ///

  const [exit] = await db
    .select({
      firstName: tacotsRecommendation.firstName,
      surname: tacotsRecommendation.firstName,
      id: tacotsExit.id,
      studentId: tacotsExit.studentId,
      schoolAttendedDuringProgram: tacotsExit.schoolAttendedDuringProgram,
      yearOfExit: tacotsExit.yearOfExit,
      exitReason: tacotsExit.exitReason,
      highestEducationAttained: tacotsExit.highestEducationAttained,
      currentStatus: tacotsExit.currentStatus,
      higherInstitutionName: tacotsExit.higherInstitutionName,
      higherInstitutionCity: tacotsExit.higherInstitutionCity,
      higherInstitutionState: tacotsExit.higherInstitutionState,
      employmentType: tacotsExit.employmentType,
      vocationalSkill: tacotsExit.vocationalSkill,
      newSchoolName: tacotsExit.newSchoolName,
      completedSecondaryElsewhere: tacotsExit.completedSecondaryElsewhere,
      programImpactDescription: tacotsExit.programImpactDescription,
      programImpactRating: tacotsExit.programImpactRating,
      additionalSituationInfo: tacotsExit.additionalSituationInfo,
      completedBy: tacotsExit.completedBy,
      submissionDate: tacotsExit.submissionDate,
      updatedAt: tacotsExit.updatedAt,
      createdAt: tacotsExit.createdAt,
      deletedAt: tacotsExit.deletedAt,
    })
    .from(tacotsExit)
    .innerJoin(tacotsOnboarding, eq(tacotsOnboarding.id, tacotsExit.studentId))
    .innerJoin(tacotsRecommendation, eq(tacotsRecommendation.id, tacotsOnboarding.studentId))
    .where(eq(tacotsExit.id, id));

  /// cache set
  await cacheSet(key, exit, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots exit data found successfully",
    data: exit,
  };
};
export const deleteTacotsExit = async (id: string, correlationId: string) => {
  await db.delete(tacotsExit).where(eq(tacotsExit.id, id));

  appEvents.emit(TACOTS_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:tacots:exit:*`,
    event: "DELETE TACOTS EXIT RECORD",
    correlationId,
  });

  return {
    code: 200,
    message: "Tacots exit data deleted successfully",
    meta: { correlationId },
  };
};
export const exportTacotsExitTableToCSV = async () => {
  const data = await db.select().from(tacotsExit);
  return data;
};
