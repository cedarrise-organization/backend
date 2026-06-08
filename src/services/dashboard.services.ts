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
import { Dataset, LineData } from "../types/dashboard.js";

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

export const getStudentPerformance = async () => {
  /*** */
  const academicYear = sql<string>`
  CASE
    WHEN EXTRACT(MONTH FROM ${ashExit.exitDate}) >= 9
    THEN CONCAT(
      EXTRACT(YEAR FROM ${ashExit.exitDate})::int,
      '/',
      EXTRACT(YEAR FROM ${ashExit.exitDate})::int + 1
    )
    ELSE CONCAT(
      EXTRACT(YEAR FROM ${ashExit.exitDate})::int - 1,
      '/',
      EXTRACT(YEAR FROM ${ashExit.exitDate})::int
    )
  END
`;

  const ashGraduated = await db
    .select({
      value: countDistinct(ashExit.studentId),
      academicYear,
    })
    .from(ashExit)
    .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"]))
    .groupBy(academicYear);
  const ashDropOuts = await db
    .select({
      value: countDistinct(ashExit.studentId),
      academicYear,
    })
    .from(ashExit)
    .where(eq(ashExit.exitReason, "DROPPED OUT"))
    .groupBy(academicYear);

  const labels = ["2025/2026", "2026/2027", "2027/2028", "2028/2029", "2029/2030"];
  const graduatedMap = new Map(ashGraduated.map((row) => [row.academicYear, Number(row.value)]));
  const dropOutMap = new Map(ashDropOuts.map((row) => [row.academicYear, Number(row.value)]));

  const c_graduationRate: Dataset = {
    type: "bar",
    labels: labels.map((label) => label.replace("20", "").replace("/20", "-")),
    datasets: [
      {
        label: "Graduated",
        data: labels.map((year) => graduatedMap.get(year) ?? 0),
      },
      {
        label: "Dropped out",
        data: labels.map((year) => dropOutMap.get(year) ?? 0),
      },
    ],
  };
  /*** */

  /*** */
  const currentYear = new Date().getFullYear();

  const attendance = await db
    .select({
      value: sql<number>`COALESCE(SUM(cardinality(${ashWeeklyAttendance.studentsInAttendance})), 0)`,
      month: sql<string>`TO_CHAR(${ashWeeklyAttendance.sessionDate}, 'YYYY-MM')`,
    })
    .from(ashWeeklyAttendance)
    .where(sql`EXTRACT(YEAR FROM ${ashWeeklyAttendance.sessionDate}) = ${currentYear}`)
    .groupBy(sql`TO_CHAR(${ashWeeklyAttendance.sessionDate}, 'YYYY-MM')`);

  const monthKeys = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${currentYear}-${month}`;
  });

  const attendanceMap = new Map(attendance.map((row) => [row.month, Number(row.value)]));
  const c_attendanceTrend: Dataset = {
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "Avg attendance", data: monthKeys.map((month) => attendanceMap.get(month) ?? 0) },
    ],
  };
  /*** */

  const c_testScores: Dataset = {
    type: "line",
    labels: ["Term 1", "Term 2", "Term 3"],
    datasets: [
      { label: "Pre-test", data: [52, 55, 57] },
      { label: "Mid-test", data: [61, 65, 68] },
      { label: "Post-test", data: [72, 76, 79] },
    ],
  };
  const c_dropoutTrend: Dataset = {
    type: "bar",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{ label: "Dropouts", data: [1, 0, 2, 3, 1, 2, 0, 1, 3, 1, 0, 0] }],
  };
  const c_risk: Dataset = {
    type: "doughnut",
    labels: ["Low-risk", "At-risk"],
    datasets: [{ data: [170, 48] }],
  };

  // console.log();
  return {
    code: 200,
    message: "Student Performance data found successfully",
    data: {
      c_graduationRate,
      c_attendanceTrend,
      c_testScores,
      c_dropoutTrend,
      c_risk,
    },
  };
};

export const getEnrollment = async () => {
  const c_applicationNumbers: Dataset = {
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "ASH", data: [14, 12, 18, 22, 19, 16, 8, 24, 21, 17, 15, 12] },
      { label: "TACOTS", data: [6, 5, 9, 10, 8, 7, 4, 11, 9, 8, 6, 5] },
    ],
  };
  const c_genderDiversity: Dataset = {
    type: "pie",
    labels: ["Female", "Male"],
    datasets: [{ data: [54, 46] }],
  };
  const c_classAgeDistribution: Dataset = {
    type: "bar",
    labels: ["Primary", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"],
    datasets: [{ label: "Students", data: [18, 28, 34, 31, 42, 38, 27] }],
  };
  const c_acceptanceRate: LineData = [
    { title: "ASH", amount: 74 },
    { title: "TACOTS", amount: 74 },
    { title: "Volunteer", amount: 74 },
  ];
  const c_geographicalDistribution: LineData = [
    { title: "Enugu", amount: 70 },
    { title: "Ebonyi", amount: 60 },
    { title: "Anambra", amount: 50 },
    { title: "Abia", amount: 40 },
    { title: "Imo", amount: 30 },
    { title: "others", amount: 20 },
  ];

  return {
    code: 200,
    message: "Enrollment and Recruitment data found successfully",
    data: {
      c_applicationNumbers,
      c_genderDiversity,
      c_classAgeDistribution,
      c_acceptanceRate,
      c_geographicalDistribution,
    },
  };
};

export const getInstEffectiveness = async () => {
  const c_communityServiceHours: Dataset = {
    type: "bar",
    labels: ["20-21", "21-22", "22-23", "23-24", "24-25"],
    datasets: [
      { label: "Total hrs", data: [310, 440, 580, 720, 890] },
      { label: "Avg/student", data: [8.2, 10.5, 12.4, 14.8, 18.1] },
    ],
  };
  const c_averageMentorshipHours: Dataset = {
    type: "line",
    labels: ["T1 Mid", "T1 End", "T2 Mid", "T2 End", "T3 Mid", "T3 End"],
    datasets: [{ label: "Avg hrs", data: [14.2, 15.2, 16.8, 18.4, 19.9, 22.1] }],
  };
  const c_studentBenchMark: Dataset = {
    type: "bar",
    labels: ["Term 1", "Term 2", "Term 3"],
    datasets: [{ label: "Meeting benchmark", data: [58, 65, 71] }],
  };
  const c_spendPerstudent: Dataset = {
    type: "bar",
    labels: ["Tuition", "Resources", "Sundries"],
    datasets: [{ label: "Avg spend", data: [180200, 57500, 27300] }],
  };
  const c_totalAccHours: LineData = [
    { title: "2025/2026", amount: 500 },
    { title: "2026/2027", amount: 400 },
    { title: "2027/2028", amount: 300 },
    { title: "2028/2029", amount: 200 },
    { title: "2029/2030", amount: 400 },
  ];
  
  return {
    code: 200,
    message: "Institutional Effectiveness data found successfully",
    data: {
      c_communityServiceHours,
      c_averageMentorshipHours,
      c_studentBenchMark,
      c_spendPerstudent,
      c_totalAccHours,
    },
  };
};

export const feature = async (req: Request, options: any) => {};
