import { eq } from "drizzle-orm";
import db from "../db/db.js";
import {
  ashStudent,
  ashTermlyTracking,
  ashWeeklyAttendance,
  ashExit,
  tacotsRecommendation,
  tacotsOnboarding,
  tacotsTracking,
  tacotsExit,
} from "../db/models/admin.js";
import { cacheGet, cacheSet, CACHE_TTL } from "../lib/cache.js";
import { NotFoundError } from "../lib/error.js";

export const ashStudentProfile = async (id: string, correlationId: string) => {
  ///
  const key = `cedarrise:ashstudentprofile:${id}`;
  const data = await cacheGet<any>(key);
  if (data) {
    return {
      code: 200,
      message: "Found Ash Student Profile Successfully",
      data,
      meta: {
        correlationId,
      },
    };
  }
  ///

  const [profileRows, termlyRows, attendanceRows, exitRows] = await Promise.all([
    // Student profile data
    db
      .select({
        id: ashStudent.id,
        passportPhotoUrl: ashStudent.passportPhotoUrl,
        firstName: ashStudent.firstName,
        middleName: ashStudent.middleName,
        surname: ashStudent.surname,
        age: ashStudent.age,
        dateOfBirth: ashStudent.dob,
        gender: ashStudent.gender,
        primaryLanguage: ashStudent.primaryLanguage,
        phone: ashStudent.studentPhone,
        homeAddress: ashStudent.homeAddress,
        status: ashStudent.status,
        programType: ashStudent.programType,
        assignedMentor: ashStudent.assignedMentor,
        // enrolledAt: ashStudent.createdAt,
        // school
        schoolName: ashStudent.schoolName,
        schoolTown: ashStudent.schoolTown,
        schoolLga: ashStudent.schoolLga,
        schoolState: ashStudent.schoolState,
        currentClass: ashStudent.currentClass,
        // family
        fathersName: ashStudent.fathersName,
        fathersPhone: ashStudent.fathersPhone,
        fathersOccupation: ashStudent.fathersOccupation,
        mothersName: ashStudent.mothersName,
        mothersPhone: ashStudent.mothersPhone,
        mothersOccupation: ashStudent.mothersOccupation,
        guardianName: ashStudent.guardianName,
        guardianRelationship: ashStudent.guardianRelationship,
        guardianPhone: ashStudent.guardianPhone,
        guardianOccupation: ashStudent.guardianOccupation,
        householdIncomeRange: ashStudent.householdIncomeRange,
        // background
        prevAfterschoolProgram: ashStudent.prevAfterschoolProgram,
        reasonForJoining: ashStudent.reasonForJoining,
        hasLearningCondition: ashStudent.hasLearningCondition,
        learningConditions: ashStudent.learningConditions,
        // documents
        parentSignatureUrl: ashStudent.parentSignatureUrl,
        // compliance
        parentConsent: ashStudent.parentConsent,
        declarationConfirmed: ashStudent.declarationConfirmed,
      })
      .from(ashStudent)
      .where(eq(ashStudent.id, id)),

    // Termly tracking (academic performance history)
    db
      .select({
        id: ashTermlyTracking.id,
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
        termResultUrl: ashTermlyTracking.termResultUrl,
        disciplineRating: ashTermlyTracking.disciplineRating,
        responsibilityRating: ashTermlyTracking.responsibilityRating,
        leadershipRating: ashTermlyTracking.leadershipRating,
        notableAchievements: ashTermlyTracking.notableAchievements,
        challengesObserved: ashTermlyTracking.challengesObserved,
        nextTermRecommendations: ashTermlyTracking.nextTermRecommendations,
        mentorName: ashTermlyTracking.mentorName,
        createdAt: ashTermlyTracking.createdAt,
      })
      .from(ashTermlyTracking)
      .where(eq(ashTermlyTracking.studentId, id)),

    // Attendance records (all sessions where this student could appear)
    db
      .select({
        sessionDate: ashWeeklyAttendance.sessionDate,
        studentsInAttendance: ashWeeklyAttendance.studentsInAttendance,
        studentsMentored: ashWeeklyAttendance.studentsMentored,
      })
      .from(ashWeeklyAttendance),

    // Exit data
    db
      .select({
        exitDate: ashExit.exitDate,
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
      })
      .from(ashExit)
      .where(eq(ashExit.studentId, id)),
  ]);

  if (!profileRows.length) {
    throw new NotFoundError("Student not found");
  }

  const p = profileRows[0]!;
  const fullName = [p.firstName, p.middleName, p.surname].filter(Boolean).join(" ");

  // Build attendance
  const attendanceHistory = attendanceRows.map((row) => ({
    sessionDate: row.sessionDate,
    attended: row.studentsInAttendance?.includes(id) ?? false,
    mentored: row.studentsMentored?.includes(id) ?? false,
  }));

  const totalSessions = attendanceRows.length;
  const sessionsAttended = attendanceHistory.filter((a) => a.attended).length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((sessionsAttended / totalSessions) * 100) : 0;

  const totalMentorshipSessions = totalSessions;
  const mentorshipSessionsAttended = attendanceHistory.filter((a) => a.mentored).length;
  const mentorshipRate =
    totalMentorshipSessions > 0
      ? Math.round((mentorshipSessionsAttended / totalMentorshipSessions) * 100)
      : 0;

  // Build academic performance
  const academicHistory = termlyRows.map((t) => ({
    id: t.id,
    academicSession: t.academicSession,
    term: t.term,
    school: {
      name: t.schoolName,
      numeracyScore: t.schoolNumeracyScore,
      literacyScore: t.schoolLiteracyScore,
      average: t.schoolAverage,
      position: t.schoolPosition,
    },
    assessments: {
      pretest: {
        numeracyScore: t.pretestNumeracyScore,
        literacyScore: t.pretestLiteracyScore,
        average: t.pretestAverage,
      },
      midtest: {
        numeracyScore: t.midtestNumeracyScore,
        literacyScore: t.midtestLiteracyScore,
        average: t.midtestAverage,
      },
      posttest: {
        numeracyScore: t.posttestNumeracyScore,
        literacyScore: t.posttestLiteracyScore,
        average: t.posttestAverage,
      },
    },
    development: {
      disciplineRating: t.disciplineRating,
      responsibilityRating: t.responsibilityRating,
      leadershipRating: t.leadershipRating,
    },
    notableAchievements: t.notableAchievements,
    challengesObserved: t.challengesObserved,
    nextTermRecommendations: t.nextTermRecommendations,
    mentorName: t.mentorName,
    resultUrl: t.termResultUrl,
  }));

  // Current averages from the most recent termly record
  const latest =
    termlyRows.length > 0
      ? termlyRows.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))[0]
      : null;

  const currentPerformance = {
    schoolAverage: latest?.schoolAverage ?? null,
    pretestAverage: latest?.pretestAverage ?? null,
    midtestAverage: latest?.midtestAverage ?? null,
    posttestAverage: latest?.posttestAverage ?? null,
  };

  // Build exit
  const exitRecord = exitRows.length > 0 ? exitRows[0] : null;
  const exit = {
    exists: !!exitRecord,
    exitDate: exitRecord?.exitDate ?? null,
    ageAtExit: exitRecord?.ageAtExit ?? null,
    schoolName: exitRecord?.schoolName ?? null,
    classAtExit: exitRecord?.classAtExit ?? null,
    durationInProgram: exitRecord?.durationInProgram ?? null,
    exitReason: exitRecord?.exitReason ?? null,
    academicImpact: {
      rating: exitRecord?.academicImpactRating ?? null,
      areasOfImprovement: exitRecord?.areasOfImprovement ?? null,
    },
    mentorship: {
      received: exitRecord?.mentorshipReceived ?? null,
      impactRating: exitRecord?.mentorshipImpactRating ?? null,
    },
    postAshStatus: {
      status: exitRecord?.postAshStatus ?? null,
      institutionName: exitRecord?.institutionName ?? null,
      courseOfStudy: exitRecord?.courseOfStudy ?? null,
      vocationalSkill: exitRecord?.vocationalSkill ?? null,
    },
    feedback: {
      enjoyedMost: exitRecord?.enjoyedMost ?? null,
      programImpact: exitRecord?.programImpact ?? null,
      improvementSuggestions: exitRecord?.improvementSuggestions ?? null,
    },
    facilitatorName: exitRecord?.facilitatorName ?? null,
  };

  //  Assemble final response
  const student = {
    summary: {
      id: p.id,
      fullName,
      passportPhotoUrl: p.passportPhotoUrl,
      status: p.status,
      programType: p.programType,
      currentClass: p.currentClass,
      assignedMentor: p.assignedMentor,
      // enrolledAt: p.enrolledAt,
    },
    profile: {
      passportPhotoUrl: p.passportPhotoUrl,
      fullName,
      age: p.age,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      primaryLanguage: p.primaryLanguage,
      phone: p.phone,
      homeAddress: p.homeAddress,
      status: p.status,
      programType: p.programType,
      assignedMentor: p.assignedMentor,
      // enrolledAt: p.enrolledAt,
    },
    school: {
      name: p.schoolName,
      town: p.schoolTown,
      lga: p.schoolLga,
      state: p.schoolState,
      currentClass: p.currentClass,
    },
    family: {
      father: {
        name: p.fathersName,
        phone: p.fathersPhone,
        occupation: p.fathersOccupation,
      },
      mother: {
        name: p.mothersName,
        phone: p.mothersPhone,
        occupation: p.mothersOccupation,
      },
      guardian: {
        name: p.guardianName,
        phone: p.guardianPhone,
        relationship: p.guardianRelationship,
        occupation: p.guardianOccupation,
      },
      householdIncomeRange: p.householdIncomeRange,
    },
    background: {
      previousAfterschoolProgram: p.prevAfterschoolProgram,
      reasonForJoining: p.reasonForJoining,
      hasLearningCondition: p.hasLearningCondition,
      learningConditions: p.learningConditions,
    },
    documents: {
      parentSignatureUrl: p.parentSignatureUrl,
    },
    compliance: {
      parentConsent: p.parentConsent,
      declarationConfirmed: p.declarationConfirmed,
    },
    academicPerformance: {
      current: currentPerformance,
      history: academicHistory,
    },
    attendance: {
      totalSessions,
      sessionsAttended,
      attendanceRate,
      totalMentorshipSessions,
      mentorshipSessionsAttended,
      mentorshipRate,
      history: attendanceHistory,
    },
    exit,
  };

  ///
  await cacheSet(key, student, CACHE_TTL.STUDENT_PROFILE);
  ///

  return {
    code: 200,
    message: "Found Ash Student Profile Successfully",
    data: student,
    meta: {
      correlationId,
    },
  };
};

export const tacotsStudentProfile = async (id: string, correlationId: string) => {
  ///
  const key = `cedarrise:tacotsstudentprofile:${id}`;
  const cached = await cacheGet<any>(key);
  if (cached) {
    return {
      code: 200,
      message: "Found TACOTS Student Profile Successfully",
      data: cached,
      meta: { correlationId },
    };
  }
  ///

  const [recommendationRows, onboardingRows] = await Promise.all([
    // Student recommendation
    db
      .select({
        id: tacotsRecommendation.id,
        firstName: tacotsRecommendation.firstName,
        middleName: tacotsRecommendation.middleName,
        surname: tacotsRecommendation.surname,
        gender: tacotsRecommendation.gender,
        age: tacotsRecommendation.age,
        dob: tacotsRecommendation.dob,
        primaryLanguage: tacotsRecommendation.primaryLanguage,
        phoneNumber: tacotsRecommendation.phoneNumber,
        nationality: tacotsRecommendation.nationality,
        stateOfOrigin: tacotsRecommendation.stateOfOrigin,
        lga: tacotsRecommendation.lga,
        homeAddress: tacotsRecommendation.homeAddress,
        passportPhotoUrl: tacotsRecommendation.passportPhotoUrl,
        lastResultUrl: tacotsRecommendation.lastResultUrl,
        // religion
        religion: tacotsRecommendation.religion,
        catholicSacraments: tacotsRecommendation.catholicSacraments,
        parishAttended: tacotsRecommendation.parishAttended,
        diocese: tacotsRecommendation.diocese,
        // previous school
        schoolName: tacotsRecommendation.schoolName,
        schoolTown: tacotsRecommendation.schoolTown,
        schoolState: tacotsRecommendation.schoolState,
        lastYearAttended: tacotsRecommendation.lastYearAttended,
        lastClass: tacotsRecommendation.lastClass,
        classPositionLastTerm: tacotsRecommendation.classPositionLastTerm,
        lastTermAverage: tacotsRecommendation.lastTermAverage,
        // family
        fathersName: tacotsRecommendation.fathersName,
        fathersOccupation: tacotsRecommendation.fathersOccupation,
        fathersPhone: tacotsRecommendation.fathersPhone,
        mothersName: tacotsRecommendation.mothersName,
        mothersOccupation: tacotsRecommendation.mothersOccupation,
        mothersPhone: tacotsRecommendation.mothersPhone,
        parentsAddress: tacotsRecommendation.parentsAddress,
        guardianName: tacotsRecommendation.guardianName,
        guardianPhone: tacotsRecommendation.guardianPhone,
        guardianRelationship: tacotsRecommendation.guardianRelationship,
        guardianOccupation: tacotsRecommendation.guardianOccupation,
        guardianAddress: tacotsRecommendation.guardianAddress,
        // household
        householdSize: tacotsRecommendation.householdSize,
        numSiblings: tacotsRecommendation.numSiblings,
        familyPosition: tacotsRecommendation.familyPosition,
        specialCircumstances: tacotsRecommendation.specialCircumstances,
        annualHouseholdIncome: tacotsRecommendation.annualHouseholdIncome,
        incomeSources: tacotsRecommendation.incomeSources,
        numIncomeEarners: tacotsRecommendation.numIncomeEarners,
        avgMonthlyIncome: tacotsRecommendation.avgMonthlyIncome,
        livesWith: tacotsRecommendation.livesWith,
        residenceType: tacotsRecommendation.residenceType,
        hasElectricity: tacotsRecommendation.hasElectricity,
        // recommender
        recommenderFirstName: tacotsRecommendation.recommenderFirstName,
        recommenderLastName: tacotsRecommendation.recommenderLastName,
        recommenderPhone: tacotsRecommendation.recommenderPhone,
        recommenderAddress: tacotsRecommendation.recommenderAddress,
        childBackgroundNotes: tacotsRecommendation.childBackgroundNotes,
        supportTypesNeeded: tacotsRecommendation.supportTypesNeeded,
        otherImportantInfo: tacotsRecommendation.otherImportantInfo,
        disciplineRating: tacotsRecommendation.disciplineRating,
        responsibilityRating: tacotsRecommendation.responsibilityRating,
        careerGoal: tacotsRecommendation.careerGoal,
        studentStatement: tacotsRecommendation.studentStatement,
        declarationConfirmed: tacotsRecommendation.declarationConfirmed,
        adminStatus: tacotsRecommendation.adminStatus,
      })
      .from(tacotsRecommendation)
      .where(eq(tacotsRecommendation.id, id)),

    // Onboarding data
    db
      .select({
        id: tacotsOnboarding.id,
        onboardingDate: tacotsOnboarding.onboardingDate,
        // mental health
        hasMentalHealthDiagnosis: tacotsOnboarding.hasMentalHealthDiagnosis,
        diagnosedConditions: tacotsOnboarding.diagnosedConditions,
        behavioralIndicators: tacotsOnboarding.behavioralIndicators,
        focusAbilityRating: tacotsOnboarding.focusAbilityRating,
        emotionalStabilityRating: tacotsOnboarding.emotionalStabilityRating,
        peerInteractionRating: tacotsOnboarding.peerInteractionRating,
        receivedCounseling: tacotsOnboarding.receivedCounseling,
        needsSpecialSupport: tacotsOnboarding.needsSpecialSupport,
        mentalHealthNotes: tacotsOnboarding.mentalHealthNotes,
        // physical health
        generalHealthStatus: tacotsOnboarding.generalHealthStatus,
        immunizationStatus: tacotsOnboarding.immunizationStatus,
        hasChronicCondition: tacotsOnboarding.hasChronicCondition,
        chronicConditions: tacotsOnboarding.chronicConditions,
        allergies: tacotsOnboarding.allergies,
        requiresMedication: tacotsOnboarding.requiresMedication,
        physicalActivityLevel: tacotsOnboarding.physicalActivityLevel,
        physicalLimitations: tacotsOnboarding.physicalLimitations,
        additionalHealthNotes: tacotsOnboarding.additionalHealthNotes,
        // enrolled school
        enrolledSchoolName: tacotsOnboarding.enrolledSchoolName,
        enrolledSchoolTown: tacotsOnboarding.enrolledSchoolTown,
        enrolledSchoolLga: tacotsOnboarding.enrolledSchoolLga,
        enrolledSchoolState: tacotsOnboarding.enrolledSchoolState,
        enrolledClass: tacotsOnboarding.enrolledClass,
        termResumptionDate: tacotsOnboarding.termResumptionDate,
        schoolFeesPerTerm: tacotsOnboarding.schoolFeesPerTerm,
        // commitments
        studentCommitment: tacotsOnboarding.studentCommitment,
        parentGuardianCommitment: tacotsOnboarding.parentGuardianCommitment,
        parentSignatureUrl: tacotsOnboarding.parentSignatureUrl,
        admissionLetterUrl: tacotsOnboarding.admissionLetterUrl,
        // support
        supportTypesApproved: tacotsOnboarding.supportTypesApproved,
        mentorName: tacotsOnboarding.mentorName,
        sponsorName: tacotsOnboarding.sponsorName,
        // notes
        programOfficerNotes: tacotsOnboarding.programOfficerNotes,
        additionalInfo: tacotsOnboarding.additionalInfo,
      })
      .from(tacotsOnboarding)
      .where(eq(tacotsOnboarding.studentId, id)),
  ]);

  if (!recommendationRows.length) {
    throw new NotFoundError("Student not found");
  }

  const r = recommendationRows[0]!;
  const o = onboardingRows.length > 0 ? onboardingRows[0]! : null;
  const fullName = [r.firstName, r.middleName, r.surname].filter(Boolean).join(" ");

  // Fetch tracking and exit using onboarding ID (both tables reference tacotsOnboarding.id)
  const onboardingId = o?.id ?? null;

  const [trackingRows, exitRows] = onboardingId
    ? await Promise.all([
        // Tracking records (academic progress, mentorship, service, financial)
        db
          .select({
            id: tacotsTracking.id,
            academicSession: tacotsTracking.academicSession,
            academicTerm: tacotsTracking.academicTerm,
            assessmentPeriod: tacotsTracking.assessmentPeriod,
            submissionDate: tacotsTracking.submissionDate,
            // academic
            highestSubjectScore: tacotsTracking.highestSubjectScore,
            lowestSubjectScore: tacotsTracking.lowestSubjectScore,
            studentAveragePct: tacotsTracking.studentAveragePct,
            studentPositionInClass: tacotsTracking.studentPositionInClass,
            termResultUrl: tacotsTracking.termResultUrl,
            academicComment: tacotsTracking.academicComment,
            // formation
            socialBehaviorRating: tacotsTracking.socialBehaviorRating,
            schoolRulesRating: tacotsTracking.schoolRulesRating,
            responsibilityRating: tacotsTracking.responsibilityRating,
            formationComments: tacotsTracking.formationComments,
            // mentorship
            mentorName: tacotsTracking.mentorName,
            mentorshipSessionDate: tacotsTracking.mentorshipSessionDate,
            mentorshipMode: tacotsTracking.mentorshipMode,
            mentorshipDuration: tacotsTracking.mentorshipDuration,
            mentorshipNotes: tacotsTracking.mentorshipNotes,
            // service
            serviceActivityType: tacotsTracking.serviceActivityType,
            serviceDate: tacotsTracking.serviceDate,
            serviceDuration: tacotsTracking.serviceDuration,
            serviceDescription: tacotsTracking.serviceDescription,
            serviceSupervisor: tacotsTracking.serviceSupervisor,
            // financial
            tuitionFeePaid: tacotsTracking.tuitionFeePaid,
            resourcesSpent: tacotsTracking.resourcesSpent,
            sundriesSpent: tacotsTracking.sundriesSpent,
            totalAmountSpent: tacotsTracking.totalAmountSpent,
            paymentEvidenceUrl: tacotsTracking.paymentEvidenceUrl,
            financialNotes: tacotsTracking.financialNotes,
            createdAt: tacotsTracking.createdAt,
          })
          .from(tacotsTracking)
          .where(eq(tacotsTracking.studentId, onboardingId)),

        // Exit data
        db
          .select({
            exitDate: tacotsExit.createdAt,
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
          })
          .from(tacotsExit)
          .where(eq(tacotsExit.studentId, onboardingId)),
      ])
    : [[], []];

  // Sort tracking records by most recent first
  const sortedTracking = [...trackingRows].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
  const latest = sortedTracking.length > 0 ? sortedTracking[0]! : null;

  // Build academic progress history
  const academicHistory = sortedTracking.map((t) => ({
    id: t.id,
    academicSession: t.academicSession,
    academicTerm: t.academicTerm,
    assessmentPeriod: t.assessmentPeriod,
    submissionDate: t.submissionDate,
    academic: {
      highestSubjectScore: t.highestSubjectScore,
      lowestSubjectScore: t.lowestSubjectScore,
      average: t.studentAveragePct,
      classPosition: t.studentPositionInClass,
      comment: t.academicComment,
      resultUrl: t.termResultUrl,
    },
    formation: {
      socialBehaviorRating: t.socialBehaviorRating,
      schoolRulesRating: t.schoolRulesRating,
      responsibilityRating: t.responsibilityRating,
      comments: t.formationComments,
    },
    mentor: {
      name: t.mentorName,
      sessionDate: t.mentorshipSessionDate,
      mode: t.mentorshipMode,
      duration: t.mentorshipDuration,
      notes: t.mentorshipNotes,
    },
    service: {
      activityType: t.serviceActivityType,
      date: t.serviceDate,
      duration: t.serviceDuration,
      description: t.serviceDescription,
      supervisor: t.serviceSupervisor,
    },
    financialSupport: {
      tuitionFeePaid: t.tuitionFeePaid,
      resourcesSpent: t.resourcesSpent,
      sundriesSpent: t.sundriesSpent,
      totalAmountSpent: t.totalAmountSpent,
      paymentEvidenceUrl: t.paymentEvidenceUrl,
      notes: t.financialNotes,
    },
  }));

  // Build mentorship history
  const mentorshipHistory = sortedTracking.map((t) => ({
    mentorName: t.mentorName,
    sessionDate: t.mentorshipSessionDate,
    mode: t.mentorshipMode,
    duration: t.mentorshipDuration,
    notes: t.mentorshipNotes,
  }));

  const latestMentorship = mentorshipHistory.length > 0 ? mentorshipHistory[0]! : null;

  // Build service engagement
  const serviceHistory = sortedTracking.map((t) => ({
    activityType: t.serviceActivityType,
    date: t.serviceDate,
    duration: t.serviceDuration,
    description: t.serviceDescription,
    supervisor: t.serviceSupervisor,
  }));

  // Build financial support totals
  const totalTuitionPaid = (trackingRows.reduce((sum, t) => sum + (t.tuitionFeePaid ?? 0), 0)).toLocaleString('en-US', {
    style: 'currency',
    currency: 'NGN',
  })
  const totalResourcesSpent = (trackingRows.reduce((sum, t) => sum + (t.resourcesSpent ?? 0), 0)).toLocaleString('en-US', {
    style: 'currency',
    currency: 'NGN',
  })
  const totalSundriesSpent = (trackingRows.reduce((sum, t) => sum + (t.sundriesSpent ?? 0), 0)).toLocaleString('en-US', {
    style: 'currency',
    currency: 'NGN',
  })
  const totalAmountSpent = (trackingRows.reduce((sum, t) => sum + (t.totalAmountSpent ?? 0), 0)).toLocaleString('en-US', {
    style: 'currency',
    currency: 'NGN',
  })

  const financialHistory = sortedTracking.map((t) => ({
    academicSession: t.academicSession,
    academicTerm: t.academicTerm,
    assessmentPeriod: t.assessmentPeriod,
    tuitionFeePaid: (t.tuitionFeePaid).toLocaleString('en-US', {
      style: 'currency',
      currency: 'NGN',
    }),
    resourcesSpent: (t.resourcesSpent).toLocaleString('en-US', {
      style: 'currency',
      currency: 'NGN',
    }),
    sundriesSpent: (t.sundriesSpent).toLocaleString('en-US', {
      style: 'currency',
      currency: 'NGN',
    }),
    totalAmountSpent: (t.totalAmountSpent).toLocaleString('en-US', {
      style: 'currency',
      currency: 'NGN',
    }),
    paymentEvidenceUrl: t.paymentEvidenceUrl,
    notes: t.financialNotes,
  }));

  //  Build exit
  const exitRecord = exitRows.length > 0 ? exitRows[0]! : null;

  //  Assemble final response
  const student = {
    summary: {
      fullName,
      status: r.adminStatus,
      onboardingDate: o?.onboardingDate ?? null,
      currentSchool: o?.enrolledSchoolName ?? null,
      currentClass: o?.enrolledClass ?? null,
      mentorName: o?.mentorName ?? null,
      sponsorName: o?.sponsorName ?? null,

      latestAcademicAverage: latest?.studentAveragePct ?? null,
      latestAcademicTerm: latest ? `${latest.academicSession} - ${latest.academicTerm}` : null,
      latestAcademicPosition: latest?.studentPositionInClass ?? null,

      supportTypesNeeded: r.supportTypesNeeded,
      supportTypesApproved: o?.supportTypesApproved ?? null,

      hasSpecialSupportNeeds: o?.needsSpecialSupport ?? null,
      hasExited: !!exitRecord,
      currentProgramStatus: r.adminStatus,
    },

    profile: {
      id: r.id,
      passportPhotoUrl: r.passportPhotoUrl,
      fullName,
      firstName: r.firstName,
      middleName: r.middleName,
      surname: r.surname,
      age: r.age,
      dateOfBirth: r.dob,
      gender: r.gender,
      primaryLanguage: r.primaryLanguage,
      phoneNumber: r.phoneNumber,
      nationality: r.nationality,
      stateOfOrigin: r.stateOfOrigin,
      lga: r.lga,
      homeAddress: r.homeAddress,
    },

    family: {
      parents: {
        father: {
          name: r.fathersName,
          occupation: r.fathersOccupation,
          phone: r.fathersPhone,
        },
        mother: {
          name: r.mothersName,
          occupation: r.mothersOccupation,
          phone: r.mothersPhone,
        },
        address: r.parentsAddress,
      },
      guardian: {
        name: r.guardianName,
        phone: r.guardianPhone,
        relationship: r.guardianRelationship,
        occupation: r.guardianOccupation,
        address: r.guardianAddress,
      },
      household: {
        householdSize: r.householdSize,
        numberOfSiblings: r.numSiblings,
        familyPosition: r.familyPosition,
        livesWith: r.livesWith,
        residenceType: r.residenceType,
        hasElectricity: r.hasElectricity,
        annualHouseholdIncome: r.annualHouseholdIncome,
        incomeSources: r.incomeSources,
        numberOfIncomeEarners: r.numIncomeEarners,
        averageMonthlyIncome: r.avgMonthlyIncome,
        specialCircumstances: r.specialCircumstances,
      },
    },

    education: {
      previous: {
        schoolName: r.schoolName,
        schoolTown: r.schoolTown,
        schoolState: r.schoolState,
        lastYearAttended: r.lastYearAttended,
        lastClass: r.lastClass,
        classPositionLastTerm: r.classPositionLastTerm,
        lastTermAverage: r.lastTermAverage,
      },
      current: {
        schoolName: o?.enrolledSchoolName ?? null,
        schoolTown: o?.enrolledSchoolTown ?? null,
        schoolLga: o?.enrolledSchoolLga ?? null,
        schoolState: o?.enrolledSchoolState ?? null,
        class: o?.enrolledClass ?? null,
        termResumptionDate: o?.termResumptionDate ?? null,
        schoolFeesPerTerm: o?.schoolFeesPerTerm ?? null,
      },
    },

    religiousBackground: {
      religion: r.religion,
      catholicSacraments: r.catholicSacraments,
      parishAttended: r.parishAttended,
      diocese: r.diocese,
    },

    recommendation: {
      recommender: {
        firstName: r.recommenderFirstName,
        lastName: r.recommenderLastName,
        phone: r.recommenderPhone,
        address: r.recommenderAddress,
      },
      childBackgroundNotes: r.childBackgroundNotes,
      supportTypesNeeded: r.supportTypesNeeded,
      otherImportantInfo: r.otherImportantInfo,
      disciplineRating: r.disciplineRating,
      responsibilityRating: r.responsibilityRating,
      careerGoal: r.careerGoal,
      studentStatement: r.studentStatement,
    },

    onboarding: {
      onboardingDate: o?.onboardingDate ?? null,
      wellbeing: {
        mentalHealth: {
          hasDiagnosis: o?.hasMentalHealthDiagnosis ?? null,
          diagnosedConditions: o?.diagnosedConditions ?? null,
          behavioralIndicators: o?.behavioralIndicators ?? null,
          focusAbilityRating: o?.focusAbilityRating ?? null,
          emotionalStabilityRating: o?.emotionalStabilityRating ?? null,
          peerInteractionRating: o?.peerInteractionRating ?? null,
          receivedCounseling: o?.receivedCounseling ?? null,
          needsSpecialSupport: o?.needsSpecialSupport ?? null,
          notes: o?.mentalHealthNotes ?? null,
        },
        physicalHealth: {
          generalHealthStatus: o?.generalHealthStatus ?? null,
          immunizationStatus: o?.immunizationStatus ?? null,
          hasChronicCondition: o?.hasChronicCondition ?? null,
          chronicConditions: o?.chronicConditions ?? null,
          allergies: o?.allergies ?? null,
          requiresMedication: o?.requiresMedication ?? null,
          physicalActivityLevel: o?.physicalActivityLevel ?? null,
          physicalLimitations: o?.physicalLimitations ?? null,
          notes: o?.additionalHealthNotes ?? null,
        },
      },
      education: {
        schoolName: o?.enrolledSchoolName ?? null,
        schoolTown: o?.enrolledSchoolTown ?? null,
        schoolLga: o?.enrolledSchoolLga ?? null,
        schoolState: o?.enrolledSchoolState ?? null,
        class: o?.enrolledClass ?? null,
        termResumptionDate: o?.termResumptionDate ?? null,
        schoolFeesPerTerm: o?.schoolFeesPerTerm ?? null,
      },
      commitments: {
        studentCommitment: o?.studentCommitment ?? null,
        parentGuardianCommitment: o?.parentGuardianCommitment ?? null,
      },
      support: {
        supportTypesApproved: o?.supportTypesApproved ?? null,
        mentorName: o?.mentorName ?? null,
        sponsorName: o?.sponsorName ?? null,
      },
      notes: {
        programOfficerNotes: o?.programOfficerNotes ?? null,
        additionalInfo: o?.additionalInfo ?? null,
      },
    },

    academicProgress: {
      current: {
        academicSession: latest?.academicSession ?? null,
        academicTerm: latest?.academicTerm ?? null,
        assessmentPeriod: latest?.assessmentPeriod ?? null,
        average: latest?.studentAveragePct ?? null,
        classPosition: latest?.studentPositionInClass ?? null,
        highestSubjectScore: latest?.highestSubjectScore ?? null,
        lowestSubjectScore: latest?.lowestSubjectScore ?? null,
        academicComment: latest?.academicComment ?? null,
      },
      history: academicHistory,
    },

    mentorship: {
      latest: latestMentorship
        ? {
            mentorName: latestMentorship.mentorName,
            sessionDate: latestMentorship.sessionDate,
            mode: latestMentorship.mode,
            duration: latestMentorship.duration,
            notes: latestMentorship.notes,
          }
        : null,
      history: mentorshipHistory,
    },

    serviceEngagement: {
      totalActivities: serviceHistory.length,
      totalDuration: serviceHistory.reduce((sum, s) => {
        const num = parseFloat(s.duration);
        return sum + (isNaN(num) ? 0 : num);
      }, 0),
      history: serviceHistory,
    },

    financialSupport: {
      totalTuitionPaid,
      totalResourcesSpent,
      totalSundriesSpent,
      totalAmountSpent,
      history: financialHistory,
    },

    documents: {
      passportPhotoUrl: r.passportPhotoUrl,
      lastResultUrl: r.lastResultUrl,
      parentSignatureUrl: o?.parentSignatureUrl ?? null,
      admissionLetterUrl: o?.admissionLetterUrl ?? null,
    },

    commitments: {
      studentCommitment: o?.studentCommitment ?? null,
      parentGuardianCommitment: o?.parentGuardianCommitment ?? null,
      declarationConfirmed: r.declarationConfirmed,
    },

    exit: {
      exitDate: exitRecord?.exitDate ?? null,
      schoolAttendedDuringProgram: exitRecord?.schoolAttendedDuringProgram ?? null,
      yearOfExit: exitRecord?.yearOfExit ?? null,
      exitReason: exitRecord?.exitReason ?? null,
      highestEducationAttained: exitRecord?.highestEducationAttained ?? null,
      currentStatus: exitRecord?.currentStatus ?? null,
      nextStep: {
        higherInstitutionName: exitRecord?.higherInstitutionName ?? null,
        higherInstitutionCity: exitRecord?.higherInstitutionCity ?? null,
        higherInstitutionState: exitRecord?.higherInstitutionState ?? null,
        employmentType: exitRecord?.employmentType ?? null,
        vocationalSkill: exitRecord?.vocationalSkill ?? null,
        newSchoolName: exitRecord?.newSchoolName ?? null,
        completedSecondaryElsewhere: exitRecord?.completedSecondaryElsewhere ?? null,
      },
      programImpact: {
        description: exitRecord?.programImpactDescription ?? null,
        rating: exitRecord?.programImpactRating ?? null,
        additionalSituationInfo: exitRecord?.additionalSituationInfo ?? null,
      },
      completedBy: exitRecord?.completedBy ?? null,
      submissionDate: exitRecord?.submissionDate ?? null,
    },
  };

  ///
  await cacheSet(key, student, CACHE_TTL.STUDENT_PROFILE);
  ///

  return {
    code: 200,
    message: "Found TACOTS Student Profile Successfully",
    data: student,
    meta: {
      correlationId,
    },
  };
};
