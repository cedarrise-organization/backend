import { UploadApiResponse } from "cloudinary";
import { tacotsRecommendation, tacotsFeedback } from "../db/models/admin.js";
import { uploadToCloudinary } from "../utils/storage.util.js";
import { cacheSet, cacheGet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import {
  TacotsrecommendationbodyType,
  TacotsfeedbackbodyType,
} from "../modules/tacots/tacots.schema.js";
import { Request } from "express";
import { sql, asc, eq } from "drizzle-orm";
import db from "../db/db.js";

const sortMap = {
  firstName: tacotsRecommendation.firstName,
  surname: tacotsRecommendation.surname,
  stateOfOrigin: tacotsRecommendation.stateOfOrigin,
  lga: tacotsRecommendation.lga,
  gender: tacotsRecommendation.gender,
  schoolName: tacotsRecommendation.schoolName,
  lastClass: tacotsRecommendation.lastClass,
  createdAt: tacotsRecommendation.createdAt,
} as const;

export const submitRecommendation = async (req: Request, options: TacotsrecommendationbodyType) => {
  const files = req.files as {
    passportPhoto: Express.Multer.File[];
    lastResult: Express.Multer.File[];
  };

  const passportFile = files.passportPhoto?.[0];
  const resultFile = files.lastResult?.[0];

  const passportUpload: any = passportFile
    ? await uploadToCloudinary(passportFile, "/Cedarrise Initiative/TACOTS-ASSETS/PASSPORTS")
    : null;

  const resultUpload: any = resultFile
    ? await uploadToCloudinary(resultFile, "/Cedarrise Initiative/TACOTS-ASSETS/RESULTS")
    : null;

  if (!passportUpload || !resultUpload) {
    throw new Error(`Could not upload passport or result`);
  }

  const [newTacotsRecommendation] = await db
    .insert(tacotsRecommendation)
    .values({
      id: sql`uuid_generate_v4()`,
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

  /// cache set
  await cacheSet(
    `cedarrise:tacots:tacotsRecommendation:${newTacotsRecommendation?.id}`,
    newTacotsRecommendation,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Tacots reccomendation form submitted successfully",
    data: newTacotsRecommendation,
  };
};

export const listRecommendations = async (
  page: number,
  limit: number,
  status: string,
  sortBy: keyof typeof sortMap,
) => {
  /// cache
  const key = `cedarrise:tacots:tacotsRecommendations:${page}:${limit}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots beneficiaries found successfully",
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

  const sortColumn = sortMap[sortBy] ?? tacotsRecommendation.createdAt;

  const tacotsBeneficiaries = await db
    .select()
    .from(tacotsRecommendation)
    .orderBy(
      sql`
          CASE
            WHEN ${tacotsRecommendation.adminStatus} = ${status} THEN 0
            ELSE 1
          END
        `,
      asc(sortColumn),
    )
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, tacotsBeneficiaries, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Ash beneficiaries found successfully",
    data: tacotsBeneficiaries,
    meta: {
      pagination: {
        page,
        limit,
      },
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

export const submitFeedback = async (options: TacotsfeedbackbodyType) => {
  const [newTacotsFeedback] = await db
    .insert(tacotsFeedback)
    .values({
      id: sql`uuid_generate_v4()`,
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

  /// cache set
  await cacheSet(
    `cedarrise:tacots:feedback:${newTacotsFeedback?.id}`,
    newTacotsFeedback,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Tacots feedback form submitted successfully",
    data: newTacotsFeedback,
  };
};

export const listFeedback = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:tacots:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Tacots feedback found successfully",
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

  const feedback = await db
    .select()
    .from(tacotsFeedback)
    .orderBy(tacotsFeedback.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Tacots feedback found successfully",
    data: feedback,
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
