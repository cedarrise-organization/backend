import { Request } from "express";
import {
  eq,
  gt,
  lt,
  gte,
  lte,
  sql,
  and,
  sum,
  avg,
  max,
  min,
  count,
  isNull,
  inArray,
  arrayContains,
  countDistinct,
} from "drizzle-orm";
import {
  ashStudent,
  ashWeeklyAttendance,
  ashProgramFeedback,
  ashTermlyTracking,
  ashExit,
  capacityBuildingEvaluation,
  tacotsExit,
  tacotsOnboarding,
  tacotsRecommendation,
  tacotsTracking,
  tacotsFeedback,
  volunteerRegistration,
  volunteerFeedback,
  outreachTracker,
} from "../db/models/admin.js";
import db from "../db/db.js";

export const getCards = async () => {
  let [volunteerApplied] = await db
    .select({ value: count(volunteerRegistration.id) })
    .from(volunteerRegistration); // Count ids because it has an index
  let [volunteeraccepted] = await db
    .select({ value: count(volunteerRegistration.id) })
    .from(volunteerRegistration)
    .where(eq(volunteerRegistration.status, "accepted")); // Count ids because it has an index
  let volunteerPartners: number = 10;
  let volunteercurrentVolunteers: number = 10;
  let volunteersponsors: number = 10;
  const volunteer = {
    applied: volunteerApplied!.value,
    accepted: volunteeraccepted!.value,
    Partners: volunteerPartners, // NOT-SUPPORTED-IN-TABLES
    currentVolunteers: volunteeraccepted!.value,
    sponsors: volunteersponsors, // NOT-SUPPORTED-IN-TABLES
  };

  let [capacityParticipantsImpacted] = await db
    .select({ value: sum(capacityBuildingEvaluation.numberOfParticipants) })
    .from(capacityBuildingEvaluation);
  let [capacityOrganizationsPartneredWith] = await db
    .select({
      value: countDistinct(sql`lower(${capacityBuildingEvaluation.partnerOrganizations})`),
    })
    .from(capacityBuildingEvaluation); // transform values to lowercase to avoid counting similar records twice
  let [capacityVolunteersEngaged] = await db
    .select({ value: max(capacityBuildingEvaluation.numberOfVolunteers) })
    .from(capacityBuildingEvaluation);
  let [capacityWorkshopsConducted] = await db
    .select({ value: count(capacityBuildingEvaluation.id) })
    .from(capacityBuildingEvaluation); // Count ids because it has an index;
  const capacityBuilding = {
    participantsImpacted: Number(capacityParticipantsImpacted!.value),
    organizationsPartneredWith: capacityOrganizationsPartneredWith!.value,
    volunteersEngaged: capacityVolunteersEngaged!.value,
    workshopsConducted: capacityWorkshopsConducted!.value,
  };

  let [outreachesCommunitiesEngaged] = await db
    .select({ value: countDistinct(sql`lower(${outreachTracker.outreachCommunity})`) })
    .from(outreachTracker); // count distinct outreach communities, transform values to lowercase to avoid counting similar records twice
  let [outreachesBeneficiariesReached] = await db
    .select({ value: sum(outreachTracker.numBeneficiaries) })
    .from(outreachTracker);
  let outreachesPartners: number = 10;
  let [outreachesVolunteers] = await db
    .select({ value: max(outreachTracker.numVolunteers) })
    .from(outreachTracker);
  let [outreachesOutreachEvents] = await db
    .select({ value: count(outreachTracker.id) })
    .from(outreachTracker); // Count ids because it has an index;
  const outreaches = {
    communitiesEngaged: outreachesCommunitiesEngaged!.value,
    beneficiariesReached: Number(outreachesBeneficiariesReached!.value),
    partners: outreachesPartners, // NOT-SUPPORTED-IN-TABLES
    volunteers: outreachesVolunteers!.value,
    outreachEvents: outreachesOutreachEvents!.value,
  };

  let [ashStudentsEnrolled] = await db
    .select({ value: count(ashStudent.id) })
    .from(ashStudent)
    .where(eq(ashStudent.status, "accepted")); // Count ids because it has an index;
  let [ashVolunteers] = await db
    .select({ value: count(volunteerRegistration.id) })
    .from(volunteerRegistration)
    .where(
      and(
        eq(volunteerRegistration.status, "accepted"),
        arrayContains(volunteerRegistration.volunteerAreas, ["ASH"]),
      ),
    );
  let [ashCommunitiesEngaged] = await db
    .select({ value: countDistinct(sql`${ashStudent.schoolLga}`) })
    .from(ashStudent)
    .where(eq(ashStudent.status, "accepted"));
  let [ashImprovedGrades] = await db
    .select({ value: countDistinct(ashTermlyTracking.studentId) })
    .from(ashTermlyTracking)
    .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
    .where(
      and(
        eq(ashStudent.status, "accepted"),
        gt(ashTermlyTracking.posttestAverage, ashTermlyTracking.pretestAverage),
      ),
    );
  let [ashCurrentBeneficiaries] = await db
    .select({ value: countDistinct(ashStudent.id) })
    .from(ashStudent)
    .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
    .where(and(eq(ashStudent.status, "accepted"), isNull(ashExit.studentId)));
  let [ashGraduated] = await db
    .select({ value: countDistinct(ashExit.studentId) })
    .from(ashExit)
    .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"]));
  let [ashDropOuts] = await db
    .select({ value: countDistinct(ashExit.studentId) })
    .from(ashExit)
    .where(eq(ashExit.exitReason, "DROPPED OUT"));
  const ash = {
    studentsEnrolled: ashStudentsEnrolled!.value,
    volunteers: ashVolunteers!.value,
    communitiesEngaged: ashCommunitiesEngaged!.value,
    improvedGrades:
      ashStudentsEnrolled!.value === 0
        ? 0
        : (ashImprovedGrades!.value / ashStudentsEnrolled!.value) * 100,
    currentBeneficiaries: ashCurrentBeneficiaries!.value,
    graduated: ashGraduated!.value,
    dropOuts: ashDropOuts!.value,
  };

  const tacots = {
    enrolled: 10,
    currentlyInSchools: 10,
    partnerSchools: 10,
    benefactors: 10,
    sponsors: 10,
    partners: 10,
    graduated: 10,
  };

  return {
    code: 200,
    message: "Cards data found successfully",
    data: {
      volunteer,
      capacityBuilding,
      outreaches,
      ash,
      tacots,
    },
  };
};

export const feature = async (req: Request, options: any) => {};
