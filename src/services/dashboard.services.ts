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
import { Data } from "ejs";

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
  // If these values are going to be a yearly thing, just add a where clause to check createdat for current year
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
    db.select({ value: count(volunteerRegistration.id) }).from(volunteerRegistration), // Count ids because it has an index
    // volunteersAccepted
    db
      .select({ value: count(volunteerRegistration.id) })
      .from(volunteerRegistration)
      .where(eq(volunteerRegistration.status, "accepted")), // Count ids because it has an index
    // capacityParticipantsImpacted
    db
      .select({ value: sum(capacityBuildingEvaluation.numberOfParticipants) })
      .from(capacityBuildingEvaluation),
    // capacityOrganizationsPartneredWith
    db
      .select({
        value: countDistinct(sql`lower(trim(${capacityBuildingEvaluation.partnerOrganizations}))`),
      })
      .from(capacityBuildingEvaluation), // transform values to lowercase to avoid counting similar records twice
    // capacityVolunteersEngaged
    db
      .select({ value: max(capacityBuildingEvaluation.numberOfVolunteers) })
      .from(capacityBuildingEvaluation),
    // capacityWorkshopsConducted
    db.select({ value: count(capacityBuildingEvaluation.id) }).from(capacityBuildingEvaluation), // Count ids because it has an index
    // outreachesCommunitiesEngaged
    db
      .select({ value: countDistinct(sql`lower(trim(${outreachTracker.outreachCommunity}))`) })
      .from(outreachTracker), // count distinct outreach communities, transform values to lowercase to avoid counting similar records twice
    // outreachesBeneficiariesReached
    db.select({ value: sum(outreachTracker.numBeneficiaries) }).from(outreachTracker),
    // outreachesVolunteers
    db.select({ value: max(outreachTracker.numVolunteers) }).from(outreachTracker),
    // outreachesOutreachEvents
    db.select({ value: count(outreachTracker.id) }).from(outreachTracker), // Count ids because it has an index
    //  ashStudentsEnrolled
    db
      .select({ value: count(ashStudent.id) })
      .from(ashStudent)
      .where(eq(ashStudent.status, "accepted")), // Count ids because it has an index
    // ashVolunteers
    db
      .select({ value: count(volunteerRegistration.id) })
      .from(volunteerRegistration)
      .where(
        and(
          eq(volunteerRegistration.status, "accepted"),
          arrayContains(volunteerRegistration.volunteerAreas, ["ASH"]),
        ),
      ),
    // ashCommunitiesEngaged
    db
      .select({ value: countDistinct(sql`lower(trim(${ashStudent.schoolLga}))`) })
      .from(ashStudent)
      .where(eq(ashStudent.status, "accepted")),
    // ashImprovedGrades
    db
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
    db
      .select({ value: countDistinct(ashStudent.id) })
      .from(ashStudent)
      .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
      .where(and(eq(ashStudent.status, "accepted"), isNull(ashExit.studentId))),
    // ashGraduated
    db
      .select({ value: countDistinct(ashExit.studentId) })
      .from(ashExit)
      .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"])),
    // ashDropOuts
    db
      .select({ value: countDistinct(ashExit.studentId) })
      .from(ashExit)
      .where(eq(ashExit.exitReason, "DROPPED OUT")),
    // tacotsEnrolled
    db.select({ value: count(tacotsOnboarding.id) }).from(tacotsOnboarding),
    // tacotsCurrentlyInSchools
    db
      .select({ value: countDistinct(tacotsOnboarding.id) })
      .from(tacotsOnboarding)
      .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id))
      .where(isNull(tacotsExit.studentId)),
    // tacotsPartnerSchools
    db
      .select({
        value: countDistinct(sql`lower(trim(${tacotsOnboarding.enrolledSchoolName}))`),
      })
      .from(tacotsOnboarding),
    // tacotsBenefactors
    db
      .select({ value: count(tacotsRecommendation.id) })
      .from(tacotsRecommendation)
      .where(eq(tacotsRecommendation.adminStatus, "SELECTED")),
    // tacotsSponsors
    db
      .select({ value: countDistinct(sql`lower(trim(${tacotsOnboarding.sponsorName}))`) })
      .from(tacotsOnboarding),
    // tacotsGraduated
    db
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
  /// cache
  const key = `cedarrise:dashboard:student-performance`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Student Performance data found successfully",
      data: cacheRes,
    };
  }
  ///

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

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentAcademicSession =
    currentMonth >= 9
      ? `${currentYear}/${String(currentYear + 1).slice(2)}`
      : `${currentYear - 1}/${String(currentYear).slice(2)}`;
  const sessionLabels = ["2025/2026", "2026/2027", "2027/2028", "2028/2029", "2029/2030"];
  const termLabels = ["Term 1", "Term 2", "Term 3"];
  const normalizedTerm = sql<string>`lower(trim(${ashTermlyTracking.term}))`;

  const [ashGraduated, ashDropOuts, attendance, testScores, dropouts, [risk], tacotsScores] =
    await Promise.all([
      // ashGraduated
      db
        .select({
          value: countDistinct(ashExit.studentId),
          academicYear,
        })
        .from(ashExit)
        .where(inArray(ashExit.exitReason, ["COMPLETED", "GRADUATED"]))
        .groupBy(academicYear),
      // ashDropOuts
      db
        .select({
          value: countDistinct(ashExit.studentId),
          academicYear,
        })
        .from(ashExit)
        .where(eq(ashExit.exitReason, "DROPPED OUT"))
        .groupBy(academicYear),
      // attendance
      db
        .select({
          value: sql<number>`COALESCE(SUM(cardinality(${ashWeeklyAttendance.studentsInAttendance})), 0)`,
          month: sql<string>`TO_CHAR(${ashWeeklyAttendance.sessionDate}, 'YYYY-MM')`,
        })
        .from(ashWeeklyAttendance)
        .where(sql`EXTRACT(YEAR FROM ${ashWeeklyAttendance.sessionDate}) = ${currentYear}`)
        .groupBy(sql`TO_CHAR(${ashWeeklyAttendance.sessionDate}, 'YYYY-MM')`),
      // testScores
      db
        .select({
          term: normalizedTerm,
          pretestAverage: sql<number>`COALESCE(AVG(${ashTermlyTracking.pretestAverage}), 0)`,
          midtestAverage: sql<number>`COALESCE(AVG(${ashTermlyTracking.midtestAverage}), 0)`,
          posttestAverage: sql<number>`COALESCE(AVG(${ashTermlyTracking.posttestAverage}), 0)`,
        })
        .from(ashTermlyTracking)
        .where(sql`EXTRACT(YEAR FROM ${ashTermlyTracking.createdAt}) = ${currentYear}`)
        .groupBy(normalizedTerm),
      // dropouts
      db
        .select({
          value: countDistinct(ashExit.studentId),
          month: sql<string>`TO_CHAR(${ashExit.exitDate}, 'YYYY-MM')`,
        })
        .from(ashExit)
        .where(
          and(
            eq(ashExit.exitReason, "DROPPED OUT"),
            sql`EXTRACT(YEAR FROM ${ashExit.exitDate}) = ${currentYear}`,
          ),
        )
        .groupBy(sql`TO_CHAR(${ashExit.exitDate}, 'YYYY-MM')`),
      // risk
      db
        .select({
          lowRisk: sql<number>`
        COUNT(DISTINCT ${ashTermlyTracking.studentId})
        FILTER (
          WHERE ${ashTermlyTracking.posttestAverage} >= 50
        )
      `,
          atRisk: sql<number>`
        COUNT(DISTINCT ${ashTermlyTracking.studentId})
        FILTER (
          WHERE ${ashTermlyTracking.posttestAverage} < 50
        )
      `,
        })
        .from(ashTermlyTracking)
        .where(sql`EXTRACT(YEAR FROM ${ashTermlyTracking.createdAt}) = ${currentYear}`),
      // tacotsScores
      db
        .select({
          academicTerm: tacotsTracking.academicTerm,
          assessmentPeriod: tacotsTracking.assessmentPeriod,
          averageScore: sql<number>`
        COALESCE(AVG(${tacotsTracking.studentAveragePct}), 0)
      `,
        })
        .from(tacotsTracking)
        .where(eq(tacotsTracking.academicSession, currentAcademicSession))
        .groupBy(tacotsTracking.academicTerm, tacotsTracking.assessmentPeriod),
    ]);

  ////
  /* ashGraduated, ashDropOuts */
  const graduatedMap = new Map(ashGraduated.map((row) => [row.academicYear, Number(row.value)]));
  const dropOutMap = new Map(ashDropOuts.map((row) => [row.academicYear, Number(row.value)]));
  const c_graduationRate: Dataset = {
    type: "bar",
    labels: sessionLabels.map((label) => label.replace("20", "").replace("/20", "-")),
    datasets: [
      {
        label: "Graduated",
        data: sessionLabels.map((year) => graduatedMap.get(year) ?? 0),
      },
      {
        label: "Dropped out",
        data: sessionLabels.map((year) => dropOutMap.get(year) ?? 0),
      },
    ],
  };
  ////

  ////
  /* attendance */
  const monthKeys = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${currentYear}-${month}`;
  });
  const attendanceMap = new Map(attendance.map((row) => [row.month, Number(row.value)]));
  const c_attendanceTrend: Dataset = {
    type: "line",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "Total attendance", data: monthKeys.map((month) => attendanceMap.get(month) ?? 0) },
    ],
  };
  ////

  ////
  /* testScores */
  const termKeys = termLabels.map((term) => term.toLowerCase());
  const testScoresMap = new Map(
    testScores.map((row) => [
      row.term,
      {
        pretestAverage: Number(row.pretestAverage),
        midtestAverage: Number(row.midtestAverage),
        posttestAverage: Number(row.posttestAverage),
      },
    ]),
  );
  const c_testScores: Dataset = {
    type: "line",
    labels: termLabels,
    datasets: [
      {
        label: "Pre-test",
        data: termKeys.map((term) => testScoresMap.get(term)?.pretestAverage ?? 0),
      },
      {
        label: "Mid-test",
        data: termKeys.map((term) => testScoresMap.get(term)?.midtestAverage ?? 0),
      },
      {
        label: "Post-test",
        data: termKeys.map((term) => testScoresMap.get(term)?.posttestAverage ?? 0),
      },
    ],
  };
  ////

  ////
  /* dropouts */
  const dropoutsMap = new Map(dropouts.map((row) => [row.month, Number(row.value)]));
  const c_dropoutTrend: Dataset = {
    type: "bar",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Dropouts",
        data: monthKeys.map((month) => dropoutsMap.get(month) ?? 0),
      },
    ],
  };
  ////

  ////
  /* risk */
  const c_risk: Dataset = {
    type: "doughnut",
    labels: ["Low-risk", "At-risk"],
    datasets: [
      {
        data: [Number(risk?.lowRisk ?? 0), Number(risk?.atRisk ?? 0)],
      },
    ],
  };
  ////

  ////
  /** tacots test scores */
  const tacotsScoreKeys = [
    {
      label: "Term 1 Mid",
      term: "1ST TERM",
      period: "MIDTERM",
    },
    {
      label: "Term 1 End",
      term: "1ST TERM",
      period: "END OF TERM",
    },
    {
      label: "Term 2 Mid",
      term: "2ND TERM",
      period: "MIDTERM",
    },
    {
      label: "Term 2 End",
      term: "2ND TERM",
      period: "END OF TERM",
    },
    {
      label: "Term 3 Mid",
      term: "3RD TERM",
      period: "MIDTERM",
    },
    {
      label: "Term 3 End",
      term: "3RD TERM",
      period: "END OF TERM",
    },
  ] as const;

  const tacotsScoresMap = new Map(
    tacotsScores.map((row) => [
      `${row.academicTerm}-${row.assessmentPeriod}`,
      Number(Number(row.averageScore).toFixed(2)),
    ]),
  );

  const getTacotsScore = (term: string, period: string) =>
    tacotsScoresMap.get(`${term}-${period}`) ?? 0;

  // Average score = AVG(studentAveragePct) for the matching academic term and assessment period within the current academic session
  const c_tacots_scores: Dataset = {
    type: "bar",
    labels: tacotsScoreKeys.map((item) => item.label),
    datasets: [
      {
        label: "Mid-term",
        data: tacotsScoreKeys.map((item) =>
          item.period === "MIDTERM" ? getTacotsScore(item.term, item.period) : null,
        ),
      },
      {
        label: "End-of-term",
        data: tacotsScoreKeys.map((item) =>
          item.period === "END OF TERM" ? getTacotsScore(item.term, item.period) : null,
        ),
      },
    ],
  };
  ////

  /// cache set
  await cacheSet(
    key,
    {
      c_graduationRate,
      c_attendanceTrend,
      c_testScores,
      c_dropoutTrend,
      c_risk,
      c_tacots_scores,
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );
  ///

  return {
    code: 200,
    message: "Student Performance data found successfully",
    data: {
      c_graduationRate,
      c_attendanceTrend,
      c_testScores,
      c_dropoutTrend,
      c_risk,
      c_tacots_scores,
    },
  };
};

export const getEnrollment = async () => {
  /// cache
  const key = `cedarrise:dashboard:enrollment`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Enrollment and Recruitment data found successfully",
      data: cacheRes,
    };
  }
  ///

  const currentYear = new Date().getFullYear();
  const normalizedAshGender = sql<string>`lower(trim(${ashStudent.gender}))`;
  const normalizedTacotsGender = sql<string>`lower(trim(${tacotsRecommendation.gender}))`;
  const normalizedAshClass = sql<string>`upper(trim(${ashStudent.currentClass}))`;
  const getPercentage = (accepted: number, total: number) =>
    total === 0 ? 0 : Number(((accepted / total) * 100).toFixed(2));
  const normalizedAshSchoolState = sql<string>`upper(trim(${ashStudent.schoolState}))`;

  const [
    ashApplications,
    tacotsApplications,
    ashGenderCounts,
    tacotsGenderCounts,
    ashClassCounts,
    [ashAcceptance],
    [tacotsAcceptance],
    [volunteerAcceptance],
    ashStateCounts,
  ] = await Promise.all([
    // ashApplications
    db
      .select({
        value: count(ashStudent.id),
        month: sql<string>`TO_CHAR(${ashStudent.createdAt}, 'YYYY-MM')`,
      })
      .from(ashStudent)
      .where(sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`)
      .groupBy(sql`TO_CHAR(${ashStudent.createdAt}, 'YYYY-MM')`),
    // tacotsApplications
    db
      .select({
        value: count(tacotsRecommendation.id),
        month: sql<string>`TO_CHAR(${tacotsRecommendation.createdAt}, 'YYYY-MM')`,
      })
      .from(tacotsRecommendation)
      .where(sql`EXTRACT(YEAR FROM ${tacotsRecommendation.createdAt}) = ${currentYear}`)
      .groupBy(sql`TO_CHAR(${tacotsRecommendation.createdAt}, 'YYYY-MM')`),
    // ashGenderCounts
    // if query is based on accepted students: .where(and(sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`, eq(ashStudent.status, "accepted")))
    db
      .select({
        gender: normalizedAshGender,
        value: count(ashStudent.id),
      })
      .from(ashStudent)
      .where(sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`)
      .groupBy(normalizedAshGender),
    // tacotsGenderCounts
    // if query is based on accepted students: .where(and(sql`EXTRACT(YEAR FROM ${tacotsRecommendation.createdAt}) = ${currentYear}`, eq(tacotsRecommendation.adminStatus, "SELECTED")))
    db
      .select({
        gender: normalizedTacotsGender,
        value: count(tacotsRecommendation.id),
      })
      .from(tacotsRecommendation)
      .where(sql`EXTRACT(YEAR FROM ${tacotsRecommendation.createdAt}) = ${currentYear}`)
      .groupBy(normalizedTacotsGender),
    // ashClassCounts
    db
      .select({
        currentClass: normalizedAshClass,
        value: count(ashStudent.id),
      })
      .from(ashStudent)
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`,
          eq(ashStudent.status, "accepted"),
        ),
      )
      .groupBy(normalizedAshClass),
    // ashAcceptance
    db
      .select({
        total: count(ashStudent.id),
        accepted: sql<number>`
        COUNT(${ashStudent.id})
        FILTER (
          WHERE ${ashStudent.status} = 'accepted'
        )
      `,
      })
      .from(ashStudent)
      .where(sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`),
    // tacotsAcceptance
    db
      .select({
        total: count(tacotsRecommendation.id),
        accepted: sql<number>`
        COUNT(${tacotsRecommendation.id})
        FILTER (
          WHERE ${tacotsRecommendation.adminStatus} = 'SELECTED'
        )
      `,
      })
      .from(tacotsRecommendation)
      .where(sql`EXTRACT(YEAR FROM ${tacotsRecommendation.createdAt}) = ${currentYear}`),
    // volunteerAcceptance
    db
      .select({
        total: count(volunteerRegistration.id),
        accepted: sql<number>`
        COUNT(${volunteerRegistration.id})
        FILTER (
          WHERE ${volunteerRegistration.status} = 'accepted'
        )
      `,
      })
      .from(volunteerRegistration)
      .where(sql`EXTRACT(YEAR FROM ${volunteerRegistration.createdAt}) = ${currentYear}`),
    // ashStateCounts
    db
      .select({
        state: normalizedAshSchoolState,
        value: count(ashStudent.id),
      })
      .from(ashStudent)
      .where(sql`EXTRACT(YEAR FROM ${ashStudent.createdAt}) = ${currentYear}`)
      .groupBy(normalizedAshSchoolState),
  ]);

  ////
  /* ashApplications, tacotsApplications */
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthKeys = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `${currentYear}-${month}`;
  });
  const ashApplicationsMap = new Map(ashApplications.map((row) => [row.month, Number(row.value)]));
  const tacotsApplicationsMap = new Map(
    tacotsApplications.map((row) => [row.month, Number(row.value)]),
  );
  const c_applicationNumbers: Dataset = {
    type: "line",
    labels: monthLabels,
    datasets: [
      {
        label: "ASH",
        data: monthKeys.map((month) => ashApplicationsMap.get(month) ?? 0),
      },
      {
        label: "TACOTS",
        data: monthKeys.map((month) => tacotsApplicationsMap.get(month) ?? 0),
      },
    ],
  };
  ////

  ////
  /* ashGenderCounts, tacotsGenderCounts */
  const genderTotals = new Map<string, number>();
  const addGenderCounts = (rows: { gender: string; value: number | string }[]) => {
    for (const row of rows) {
      genderTotals.set(row.gender, (genderTotals.get(row.gender) ?? 0) + Number(row.value));
    }
  };
  addGenderCounts(ashGenderCounts);
  addGenderCounts(tacotsGenderCounts);
  const c_genderDiversity: Dataset = {
    type: "pie",
    labels: ["Female", "Male"],
    datasets: [
      {
        data: [genderTotals.get("female") ?? 0, genderTotals.get("male") ?? 0],
      },
    ],
  };
  ////

  ////
  /* ashClassCounts */
  const classCountMap = new Map(ashClassCounts.map((row) => [row.currentClass, Number(row.value)]));
  const primaryClasses = [
    "PRIMARY 1",
    "PRIMARY 2",
    "PRIMARY 3",
    "PRIMARY 4",
    "PRIMARY 5",
    "PRIMARY 6",
  ];
  const getClassCount = (className: string) => classCountMap.get(className) ?? 0;
  const c_classDistribution: Dataset = {
    type: "bar",
    labels: ["Primary", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"],
    datasets: [
      {
        label: "Students",
        data: [
          primaryClasses.reduce((total, className) => total + getClassCount(className), 0),
          getClassCount("JSS1"),
          getClassCount("JSS2"),
          getClassCount("JSS3"),
          getClassCount("SS1"),
          getClassCount("SS2"),
          getClassCount("SS3"),
        ],
      },
    ],
  };
  ////

  ////
  /* ashAcceptance, tacotsAcceptance, volunteerAcceptance */
  const c_acceptanceRate: LineData = [
    {
      title: "ASH",
      amount: getPercentage(
        Number(ashAcceptance?.accepted ?? 0),
        Number(ashAcceptance?.total ?? 0),
      ),
    },
    {
      title: "TACOTS",
      amount: getPercentage(
        Number(tacotsAcceptance?.accepted ?? 0),
        Number(tacotsAcceptance?.total ?? 0),
      ),
    },
    {
      title: "Volunteer",
      amount: getPercentage(
        Number(volunteerAcceptance?.accepted ?? 0),
        Number(volunteerAcceptance?.total ?? 0),
      ),
    },
  ];
  ////

  ////
  /* ashStateCounts */
  const ashStateCountMap = new Map(ashStateCounts.map((row) => [row.state, Number(row.value)]));
  const featuredStates = ["ENUGU", "EBONYI", "ANAMBRA", "ABIA", "IMO"];
  const othersCount = ashStateCounts.reduce((total, row) => {
    if (featuredStates.includes(row.state)) return total;
    return total + Number(row.value);
  }, 0);
  const c_geographicalDistribution: LineData = [
    {
      title: "ENUGU",
      amount: ashStateCountMap.get("ENUGU") ?? 0,
    },
    {
      title: "EBONYI",
      amount: ashStateCountMap.get("EBONYI") ?? 0,
    },
    {
      title: "ANAMBRA",
      amount: ashStateCountMap.get("ANAMBRA") ?? 0,
    },
    {
      title: "ABIA",
      amount: ashStateCountMap.get("ABIA") ?? 0,
    },
    {
      title: "IMO",
      amount: ashStateCountMap.get("IMO") ?? 0,
    },
    {
      title: "OTHERS",
      amount: othersCount,
    },
  ];
  ////

  /// cache set
  await cacheSet(
    key,
    {
      c_applicationNumbers,
      c_genderDiversity,
      c_classDistribution,
      c_acceptanceRate,
      c_geographicalDistribution,
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );
  ///

  return {
    code: 200,
    message: "Enrollment and Recruitment data found successfully",
    data: {
      c_applicationNumbers,
      c_genderDiversity,
      c_classDistribution,
      c_acceptanceRate,
      c_geographicalDistribution,
    },
  };
};

export const getInstEffectiveness = async () => {
  /// cache
  const key = `cedarrise:dashboard:institutional-effectiveness`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Institutional Effectiveness data found successfully",
      data: cacheRes,
    };
  }
  ///

  const sessionLabels = ["2025/26", "2026/27", "2027/28", "2028/29", "2029/30"];
  const serviceHours = sql<number>`
    CASE ${tacotsTracking.serviceDuration}
      WHEN '30 MINS' THEN 0.5
      WHEN '1 HOUR' THEN 1
      WHEN '2 HOURS' THEN 2
      WHEN '3 HOURS' THEN 3
      WHEN '4 HOURS' THEN 4
      WHEN '5 HOURS' THEN 5
      WHEN 'MORE THAN 5 HOURS' THEN 6
      ELSE 0
    END
  `;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentAcademicSession =
    currentMonth >= 9
      ? `${currentYear}/${String(currentYear + 1).slice(2)}`
      : `${currentYear - 1}/${String(currentYear).slice(2)}`;
  console.log(currentAcademicSession);
  const mentorshipHours = sql<number>`
    CASE ${tacotsTracking.mentorshipDuration}
      WHEN '15 MINUTES' THEN 0.25
      WHEN '30 MINUTES' THEN 0.5
      WHEN '45 MINUTES' THEN 0.75
      WHEN '60 MINUTES' THEN 1
      WHEN 'MORE THAN 60 MINUTES' THEN 1.5
      ELSE 0
    END
  `;
  const normalizedAshTerm = sql<string>`upper(trim(${ashTermlyTracking.term}))`;

  const [
    communityServiceHours,
    mentorshipData,
    [spendPerStudent],
    totalAccHours,
    studentBenchmark,
  ] = await Promise.all([
    // communityServiceHours
    db
      .select({
        academicSession: tacotsTracking.academicSession,
        totalHours: sql<number>`
        COALESCE(SUM(${serviceHours}), 0)
      `,
        avgPerStudent: sql<number>`
        CASE
          WHEN COUNT(DISTINCT ${tacotsTracking.studentId}) = 0 THEN 0
          ELSE COALESCE(SUM(${serviceHours}), 0) / COUNT(DISTINCT ${tacotsTracking.studentId})
        END
      `,
      })
      .from(tacotsTracking)
      .groupBy(tacotsTracking.academicSession),
    // mentorshipData
    db
      .select({
        academicTerm: tacotsTracking.academicTerm,
        assessmentPeriod: tacotsTracking.assessmentPeriod,
        avgHours: sql<number>`COALESCE(AVG(${mentorshipHours}), 0)`,
      })
      .from(tacotsTracking)
      .where(eq(tacotsTracking.academicSession, currentAcademicSession))
      .groupBy(tacotsTracking.academicTerm, tacotsTracking.assessmentPeriod),
    // spendPerStudent
    db
      .select({
        avgTuition: sql<number>`
        COALESCE(
          SUM(${tacotsTracking.tuitionFeePaid}) / NULLIF(COUNT(DISTINCT ${tacotsTracking.studentId}), 0),
          0
        )
      `,
        avgResources: sql<number>`
        COALESCE(
          SUM(${tacotsTracking.resourcesSpent}) / NULLIF(COUNT(DISTINCT ${tacotsTracking.studentId}), 0),
          0
        )
      `,
        avgSundries: sql<number>`
        COALESCE(
          SUM(${tacotsTracking.sundriesSpent}) / NULLIF(COUNT(DISTINCT ${tacotsTracking.studentId}), 0),
          0
        )
      `,
        avgTotal: sql<number>`
        COALESCE(
          SUM(${tacotsTracking.totalAmountSpent}) / NULLIF(COUNT(DISTINCT ${tacotsTracking.studentId}), 0),
          0
        )
      `,
      })
      .from(tacotsTracking)
      .where(eq(tacotsTracking.academicSession, currentAcademicSession)),
    // totalAccHours
    db
      .select({
        academicSession: tacotsTracking.academicSession,
        value: sql<number>`
        COALESCE(SUM(${mentorshipHours}), 0)
      `,
      })
      .from(tacotsTracking)
      .groupBy(tacotsTracking.academicSession),
    // studentBenchmark
    db
      .select({
        term: normalizedAshTerm,
        value: countDistinct(ashTermlyTracking.studentId),
      })
      .from(ashTermlyTracking)
      .where(
        and(
          eq(ashTermlyTracking.academicSession, currentAcademicSession),
          gt(ashTermlyTracking.posttestAverage, 50),
        ),
      )
      .groupBy(normalizedAshTerm),
  ]);

  ////
  /* communityServiceHours */
  const communityServiceMap = new Map(
    communityServiceHours.map((row) => [
      row.academicSession,
      {
        totalHours: Number(row.totalHours),
        avgPerStudent: Number(Number(row.avgPerStudent).toFixed(2)),
      },
    ]),
  );
  // Avg/student = total community service hours in that academic session / unique students tracked in that academic session
  const c_communityServiceHours: Dataset = {
    type: "bar",
    labels: sessionLabels.map((session) => session.replace("20", "").replace("/", "-")),
    datasets: [
      {
        label: "Total hrs",
        data: sessionLabels.map((session) => communityServiceMap.get(session)?.totalHours ?? 0),
      },
      {
        label: "Avg/student",
        data: sessionLabels.map((session) => communityServiceMap.get(session)?.avgPerStudent ?? 0),
      },
    ],
  };
  ////

  ////
  /* mentorshipData */
  const mentorshipMap = new Map(
    mentorshipData.map((row) => [
      `${row.academicTerm}-${row.assessmentPeriod}`,
      Number(Number(row.avgHours).toFixed(2)),
    ]),
  );
  const mentorshipKeys = [
    { label: "T1 Mid", term: "1ST TERM", period: "MIDTERM" },
    { label: "T1 End", term: "1ST TERM", period: "END OF TERM" },
    { label: "T2 Mid", term: "2ND TERM", period: "MIDTERM" },
    { label: "T2 End", term: "2ND TERM", period: "END OF TERM" },
    { label: "T3 Mid", term: "3RD TERM", period: "MIDTERM" },
    { label: "T3 End", term: "3RD TERM", period: "END OF TERM" },
  ];
  // Avg hrs = average mentorship duration for that term + assessment period in the current academic session
  // T1 Mid = average mentorship hours where:
  // academicSession = currentAcademicSession
  // academicTerm = "1ST TERM"
  // assessmentPeriod = "MIDTERM"
  const c_averageMentorshipHours: Dataset = {
    type: "line",
    labels: mentorshipKeys.map((item) => item.label),
    datasets: [
      {
        label: "Avg hrs",
        data: mentorshipKeys.map((item) => {
          const key = `${item.term}-${item.period}`;
          return mentorshipMap.get(key) ?? 0;
        }),
      },
    ],
  };
  ////

  ////
  /* spendPerStudent */
  const formatMoneyValue = (value: number | string | null | undefined) =>
    Number(Number(value ?? 0).toFixed(2));
  // Avg spend per student = total amount for that category / unique students in current academic session
  const c_spendPerstudent: Dataset = {
    type: "bar",
    labels: ["Tuition", "Resources", "Sundries", "Total"],
    datasets: [
      {
        label: "Avg spend",
        data: [
          formatMoneyValue(spendPerStudent?.avgTuition),
          formatMoneyValue(spendPerStudent?.avgResources),
          formatMoneyValue(spendPerStudent?.avgSundries),
          formatMoneyValue(spendPerStudent?.avgTotal),
        ],
      },
    ],
  };
  ////

  ////
  /* totalAccHours */
  const totalAccHoursMap = new Map(
    totalAccHours.map((row) => [row.academicSession, Number(row.value)]),
  );
  const c_totalAccHours: LineData = sessionLabels.map((session) => {
    const [startYear, endYear] = session.split("/");
    return {
      title: `${startYear}/20${endYear}`,
      amount: totalAccHoursMap.get(session) ?? 0,
    };
  });
  ////

  ////
  /* studentBenchmark */
  const studentBenchmarkMap = new Map(studentBenchmark.map((row) => [row.term, Number(row.value)]));
  const benchmarkTermKeys = [
    { label: "TERM 1", value: "1ST TERM" },
    { label: "TERM 2", value: "2ND TERM" },
    { label: "TERM 3", value: "3RD TERM" },
  ];
  const c_studentBenchMark: Dataset = {
    type: "bar",
    labels: benchmarkTermKeys.map((term) => term.label),
    datasets: [
      {
        label: "Meeting benchmark",
        data: benchmarkTermKeys.map((term) => studentBenchmarkMap.get(term.label) ?? 0),
      },
    ],
  };
  ////

  /// cache set
  await cacheSet(
    key,
    {
      c_communityServiceHours,
      c_averageMentorshipHours,
      c_spendPerstudent,
      c_totalAccHours,
      c_studentBenchMark,
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );
  ///

  return {
    code: 200,
    message: "Institutional Effectiveness data found successfully",
    data: {
      c_communityServiceHours,
      c_averageMentorshipHours,
      c_spendPerstudent,
      c_totalAccHours,
      c_studentBenchMark,
    },
  };
};

export const feature = async (req: Request, options: any) => {};
