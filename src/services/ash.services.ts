import { AshstudentbodyType, AshprogramfeedbackType } from "../modules/ash/ash.schema.js";
import { ashStudent, ashProgramFeedback } from "../db/models/admin.js";
import { uploadToCloudinary } from "../utils/storage.util.js";
import { UploadApiResponse } from "cloudinary";
import { CACHE_TTL, cacheSet } from "../lib/cache.js";
import { Request } from "express";
import { sql } from "drizzle-orm";
import db from "../db/db.js";

export const submitRegistration = async (req: Request, options: AshstudentbodyType) => {
  const files = req.files as {
    passportPhoto: Express.Multer.File[];
    lastResult?: Express.Multer.File[];
    parentSignature: Express.Multer.File[];
  };

  const passportFile = files.passportPhoto?.[0];
  const resultFile = files.lastResult?.[0];
  const signatureFile = files.parentSignature?.[0];

  const passportUpload: any = passportFile
    ? await uploadToCloudinary(passportFile, "/Cedarrise Initiative/ASH-ASSETS/PASSPORTS")
    : null;

  const resultUpload: any = resultFile
    ? await uploadToCloudinary(resultFile, "/Cedarrise Initiative/ASH-ASSETS/RESULTS")
    : null;

  const signatureUpload: any = signatureFile
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
      dob: sql`TO_DATE(${options.dob}, 'DD-MM-YYYY')`,
      primaryLanguage: options.primaryLanguage,
      homeAddress: options.homeAddress,
      studentPhone: options.studentPhone,
      passportPhotoUrl: passportUpload ? passportUpload.secure_url : "",
      schoolName: options.schoolName,
      schoolTown: options.schoolTown,
      schoolLga: options.schoolLga,
      schoolState: options.schoolState,
      currentClass: options.currentClass,
      classPositionLastTerm: options.classPositionLastTerm,
      lastResultUrl: resultUpload ? resultUpload.secure_url : null,
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
    `cedarrise:ash:ashProgramFeedback:${newAshProgramFeedback?.id}`,
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
