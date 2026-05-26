import { volunteerRegistration, volunteerFeedback } from "../db/models/admin.js";
import { cacheSet, cacheGet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import {
  VolunteerregistrationbodyType,
  VolunteerfeedbackbodyType,
} from "../modules/volunteer/volunteer.schema.js";
import { Request } from "express";
import { sql, asc, eq } from "drizzle-orm";
import db from "../db/db.js";

const sortMap = {
  firstName: volunteerRegistration.firstName,
  surname: volunteerRegistration.surname,
  emailAddress: volunteerRegistration.emailAddress,
  phoneNumber: volunteerRegistration.phoneNumber,
  state: volunteerRegistration.state,
  registrationDate: volunteerRegistration.registrationDate,
  volunteerAreas: volunteerRegistration.volunteerAreas,
  createdAt: volunteerRegistration.createdAt,
} as const;

export const submitRegistration = async (options: VolunteerregistrationbodyType) => {
  const [newVolunteerSubmission] = await db
    .insert(volunteerRegistration)
    .values({
      id: sql`uuid_generate_v4()`,
      firstName: options.firstName,
      middleName: options.middleName,
      surname: options.surname,
      gender: options.gender,
      dob: sql`TO_DATE(${options.dob}, 'YYYY-MM-DD')`,
      age: options.age,
      phoneNumber: options.phoneNumber,
      emailAddress: options.emailAddress,
      homeAddress: options.homeAddress,
      city: options.city,
      state: options.state,
      occupation: options.occupation,
      highestEducation: options.highestEducation,
      reasonForVolunteering: options.reasonForVolunteering,
      volunteerAreas: options.volunteerAreas,
      skillsToContribute: options.skillsToContribute,
      availability: options.availability,
      commitmentDuration: options.commitmentDuration,
      ashInterest: options.ashInterest,
      ashSaturdayAvailability: options.ashSaturdayAvailability,
      ashAcademicArea: options.ashAcademicArea,
      ashExtracurricular: options.ashExtracurricular,
      safeguardingAgreement: options.safeguardingAgreement,
      mediaConsent: options.mediaConsent,
      additionalInfo: options.additionalInfo,
      registrationDate: sql`TO_DATE(${options.registrationDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:volunteer:voluntee:${newVolunteerSubmission?.id}`,
    newVolunteerSubmission,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Volunteer registration form submitted successfully",
    data: newVolunteerSubmission,
  };
};

export const listVolunteers = async (
  page: number,
  limit: number,
  status: string,
  sortBy: keyof typeof sortMap,
) => {
  /// cache
  const key = `cedarrise:volunteer:volunteers:${page}:${limit}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteers found successfully",
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

  const sortColumn = sortMap[sortBy] ?? volunteerRegistration.createdAt;

  const volunteers = await db
    .select()
    .from(volunteerRegistration)
    .orderBy(
      sql`
        CASE
          WHEN ${volunteerRegistration.status} = ${status} THEN 0
          ELSE 1
        END
      `,
      asc(sortColumn),
    )
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, volunteers, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Volunteers found successfully",
    data: volunteers,
    meta: {
      pagination: {
        page,
        limit,
      },
    },
  };
};

export const getVolunteer = async (id: string) => {
  /// cache
  const key = `cedarrise:volunteer:voluntee:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteer found successfully",
      data: cacheRes,
    };
  }
  ///

  const [volunteer] = await db
    .select()
    .from(volunteerRegistration)
    .where(eq(volunteerRegistration.id, id));

  /// cache set
  await cacheSet(key, volunteer, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Volunteer found successfully",
    data: volunteer,
  };
};

export const submitVolunteerFeedback = async (options: VolunteerfeedbackbodyType) => {
  const [newVolunteerFeedback] = await db
    .insert(volunteerFeedback)
    .values({
      id: sql`uuid_generate_v4()`,
      firstName: options.firstName,
      surname: options.surname,
      programVolunteered: options.programVolunteered,
      specificProgramDetails: options.specificProgramDetails,
      volunteerDuration: options.volunteerDuration,
      overallExperienceRating: options.overallExperienceRating,
      roleClarityRating: options.roleClarityRating,
      teamSupportRating: options.teamSupportRating,
      organizationRating: options.organizationRating,
      programMadeImpact: options.programMadeImpact,
      waysProgramHelped: options.waysProgramHelped,
      activitiesInvolvedIn: options.activitiesInvolvedIn,
      skillsDeveloped: options.skillsDeveloped,
      skillsGained: options.skillsGained,
      enjoyedMost: options.enjoyedMost,
      challengesExperienced: options.challengesExperienced,
      improvementSuggestions: options.improvementSuggestions,
      continueVolunteering: options.continueVolunteering,
      wouldRecommend: options.wouldRecommend,
      additionalComments: options.additionalComments,
      submissionDate: sql`TO_DATE(${options.submissionDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  /// cache set
  await cacheSet(
    `cedarrise:volunteer:feedback:${newVolunteerFeedback?.id}`,
    newVolunteerFeedback,
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 201,
    message: "Volunteer Feedback form submitted successfully",
    data: newVolunteerFeedback,
  };
};

export const listFeedback = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:volunteer:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteer feedback successfully",
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
    .from(volunteerFeedback)
    .orderBy(volunteerFeedback.createdAt)
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Volunteer feedback successfully",
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
  const key = `cedarrise:volunteer:feedback:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Single volunteer feedback found successfully",
      data: cacheRes,
    };
  }
  ///

  const [feedback] = await db.select().from(volunteerFeedback).where(eq(volunteerFeedback.id, id));

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Single volunteer feedback found successfully",
    data: feedback,
  };
};
