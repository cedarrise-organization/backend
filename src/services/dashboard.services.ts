import { Request } from "express";
import { cacheGet, CACHE_TTL, cacheSet, cacheDel } from "../lib/cache.js";
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
  /// cache
  const key = `cedarrise:dashboard:cards`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Cards data found successfully",
      data: cacheRes,
    };
  }
  ///

  let volunteerPartners: number = 10;
  let volunteercurrentVolunteers: number = 10;
  let volunteersponsors: number = 10;
  let outreachesPartners: number = 10;
  let tacotsPartners: number = 10;
  const [
    [volunteersApplied],
    [volunteersAccepted],
    [capacityParticipantsImpacted],
    [capacityOrganizationsPartneredWith],
    [capacityVolunteersEngaged],
    [capacityWorkshopsConducted],
    [outreachesCommunitiesEngaged],
    [outreachesBeneficiariesReached],
    [outreachesVolunteers],
    [outreachesOutreachEvents],
    [ashStudentsEnrolled],
    [ashVolunteers],
    [ashCommunitiesEngaged],
    [ashImprovedGrades],
    [ashCurrentBeneficiaries],
    [ashGraduated],
    [ashDropOuts],
    [tacotsEnrolled],
    [tacotsCurrentlyInSchools],
    [tacotsPartnerSchools],
    [tacotsBenefactors],
    [tacotsSponsors],
    [tacotsGraduated],
  ] = await Promise.all([
    // volunteersApplied
    await db.select({ value: count(volunteerRegistration.id) }).from(volunteerRegistration), // Count ids because it has an index
    // volunteersAccepted
    await db
      .select({ value: count(volunteerRegistration.id) })
      .from(volunteerRegistration)
      .where(eq(volunteerRegistration.status, "accepted")), // Count ids because it has an index
    // capacityParticipantsImpacted
    await db
      .select({ value: sum(capacityBuildingEvaluation.numberOfParticipants) })
      .from(capacityBuildingEvaluation),
    // capacityOrganizationsPartneredWith
    await db
      .select({
        value: countDistinct(sql`lower(trim(${capacityBuildingEvaluation.partnerOrganizations}))`),
      })
      .from(capacityBuildingEvaluation), // transform values to lowercase to avoid counting similar records twice
    // capacityVolunteersEngaged
    await db
      .select({ value: max(capacityBuildingEvaluation.numberOfVolunteers) })
      .from(capacityBuildingEvaluation),
    // capacityWorkshopsConducted
    await db
      .select({ value: count(capacityBuildingEvaluation.id) })
      .from(capacityBuildingEvaluation), // Count ids because it has an index
    // outreachesCommunitiesEngaged
    await db
      .select({ value: countDistinct(sql`lower(trim(${outreachTracker.outreachCommunity}))`) })
      .from(outreachTracker), // count distinct outreach communities, transform values to lowercase to avoid counting similar records twice
    // outreachesBeneficiariesReached
    await db.select({ value: sum(outreachTracker.numBeneficiaries) }).from(outreachTracker),
    // outreachesVolunteers
    await db.select({ value: max(outreachTracker.numVolunteers) }).from(outreachTracker),
    // outreachesOutreachEvents
    await db.select({ value: count(outreachTracker.id) }).from(outreachTracker), // Count ids because it has an index
    //  ashStudentsEnrolled
    await db
      .select({ value: count(ashStudent.id) })
      .from(ashStudent)
      .where(eq(ashStudent.status, "accepted")), // Count ids because it has an index
    // ashVolunteers
    await db
      .select({ value: count(volunteerRegistration.id) })
      .from(volunteerRegistration)
      .where(
        and(
          eq(volunteerRegistration.status, "accepted"),
          arrayContains(volunteerRegistration.volunteerAreas, ["ASH"]),
        ),
      ),
    // ashCommunitiesEngaged
    await db
      .select({ value: countDistinct(sql`lower(trim(${ashStudent.schoolLga}))`) })
      .from(ashStudent)
      .where(eq(ashStudent.status, "accepted")),
    // ashImprovedGrades
    await db
      .select({ value: countDistinct(ashTermlyTracking.studentId) })
      .from(ashTermlyTracking)
      .innerJoin(ashStudent, eq(ashStudent.id, ashTermlyTracking.studentId))
      .where(
        and(
          eq(ashStudent.status, "accepted"),
          gt(ashTermlyTracking.posttestAverage, ashTermlyTracking.pretestAverage),
        ),
      ),
    // ashCurrentBeneficiaries
    await db
      .select({ value: countDistinct(ashStudent.id) })
      .from(ashStudent)
      .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
      .where(and(eq(ashStudent.status, "accepted"), isNull(ashExit.studentId))),
    // ashGraduated
    await db
      .select({ value: countDistinct(ashExit.studentId) })
      .from(ashExit)
      .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"])),
    // ashDropOuts
    await db
      .select({ value: countDistinct(ashExit.studentId) })
      .from(ashExit)
      .where(eq(ashExit.exitReason, "DROPPED OUT")),
    // tacotsEnrolled
    await db.select({ value: count(tacotsOnboarding.id) }).from(tacotsOnboarding),
    // tacotsCurrentlyInSchools
    await db
      .select({ value: countDistinct(tacotsOnboarding.id) })
      .from(tacotsOnboarding)
      .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id))
      .where(isNull(tacotsExit.studentId)),
    // tacotsPartnerSchools
    await db
      .select({
        value: countDistinct(sql`lower(trim(${tacotsOnboarding.enrolledSchoolName}))`),
      })
      .from(tacotsOnboarding),
    // tacotsBenefactors
    await db
      .select({ value: count(tacotsRecommendation.id) })
      .from(tacotsRecommendation)
      .where(eq(tacotsRecommendation.adminStatus, "SELECTED")),
    // tacotsSponsors
    await db
      .select({ value: countDistinct(sql`lower(trim(${tacotsOnboarding.sponsorName}))`) })
      .from(tacotsOnboarding),
    // tacotsGraduated
    await db
      .select({ value: countDistinct(tacotsExit.studentId) })
      .from(tacotsExit)
      .where(inArray(tacotsExit.exitReason, ["COMPLETED SECONDARY EDUCATION (GRADUATED)"])),
  ]);

  const volunteer = {
    applied: volunteersApplied!.value,
    accepted: volunteersAccepted!.value,
    Partners: volunteerPartners, // NOT-SUPPORTED-IN-TABLES
    currentVolunteers: volunteersAccepted!.value,
    sponsors: volunteersponsors, // NOT-SUPPORTED-IN-TABLES
  };
  const capacityBuilding = {
    participantsImpacted: Number(capacityParticipantsImpacted!.value),
    organizationsPartneredWith: capacityOrganizationsPartneredWith!.value,
    volunteersEngaged: capacityVolunteersEngaged!.value,
    workshopsConducted: capacityWorkshopsConducted!.value,
  };
  const outreaches = {
    communitiesEngaged: outreachesCommunitiesEngaged!.value,
    beneficiariesReached: Number(outreachesBeneficiariesReached!.value),
    partners: outreachesPartners, // NOT-SUPPORTED-IN-TABLES
    volunteers: outreachesVolunteers!.value,
    outreachEvents: outreachesOutreachEvents!.value,
  };
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
    enrolled: tacotsEnrolled!.value,
    currentlyInSchools: tacotsCurrentlyInSchools!.value,
    partnerSchools: tacotsPartnerSchools!.value,
    benefactors: tacotsBenefactors!.value,
    sponsors: tacotsSponsors!.value,
    partners: tacotsPartners, // NOT-SUPPORTED-IN-TABLES
    graduated: tacotsGraduated!.value,
  };

  /// cache set
  await cacheSet(
    key,
    {
      volunteer,
      capacityBuilding,
      outreaches,
      ash,
      tacots,
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );
  ///

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
