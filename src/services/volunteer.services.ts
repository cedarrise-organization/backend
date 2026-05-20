import { volunteerFeedback, volunteerRegistration } from "../db/models/admin.js";
import { cacheSet, CACHE_TTL } from "../lib/cache.js";
import {
  VolunteerregistrationbodyType,
  VolunteerfeedbackbodyType,
} from "../modules/volunteer/volunteer.schema.js";
import { Request } from "express";
import { sql } from "drizzle-orm";
import db from "../db/db.js";

export const submitRegistration = async (req: Request, options: VolunteerregistrationbodyType) => {
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
