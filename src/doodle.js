   programType,
    firstName,
    middleName,
    surname,
    gender,
    age,
    dob,
    primaryLanguage,
    homeAddress,
    studentPhone,
    passportPhotoUrl,

    schoolName,
    schoolTown,
    schoolLga,
    schoolState,
    currentClass,
    classPositionLastTerm,
    lastResultUrl,

    prevAfterschoolProgram,
    reasonForJoining,
    fathersName,
    fathersPhone,
    fathersOccupation,
    mothersName,
    mothersPhone,
    mothersOccupation,

    guardianName,
    guardianRelationship ,
    guardianPhone,
    guardianOccupation,

    householdIncomeRange,
    hasLearningCondition,
    learningConditions,

    parentConsent,
    declarationConfirmed,
    parentSignatureUrl,

    assignedMentor,
    pretestScore

    import { Request } from "express";
    import { ashStudent } from "../db/models/admin.js";
    import db from "../db/db.js";
    import { sql } from "drizzle-orm";
    
    export const submitRegisteration = async (
      req: Request,
      options: {
        programType: string;
        firstName: string;
        middleName?: string;
        surname: string;
        gender: string;
        age: number;
        dob: Date;
        primaryLanguage: string;
        homeAddress: string;
        studentPhone?: string;
        schoolName: string;
        schoolTown: string;
        schoolLga: string;
        schoolState: string;
        currentClass: string;
        classPositionLastTerm: string;
        prevAfterschoolProgram: string;
        reasonForJoining: string;
        fathersName: string;
        fathersPhone?: string;
        fathersOccupation: string;
        mothersName: string;
        mothersPhone: string;
        mothersOccupation?: string;
        guardianName?: string;
        guardianRelationship?: string;
        guardianPhone?: string;
        guardianOccupation?: string;
        householdIncomeRange?: string;
        hasLearningCondition: string;
        learningConditions?: string[];
        parentConsent: boolean;
        declarationConfirmed: boolean;
        assignedMentor?: string;
        pretestScore?: number;
        status?: string;
      },
    ) => {
      const newAshStudent = await db.insert(ashStudent).values({
        id: sql`uuid_generate_v4()`,
        programType: options.programType,
        firstName: options.firstName,
        middleName: options.middleName,
        surname: options.surname,
        gender: options.gender,
        age: options.age,
        dob: sql`TO_TIMESTAMP(${options.dob})`,
        primaryLanguage: options.primaryLanguage,
        homeAddress: options.homeAddress,
        studentPhone: options.studentPhone,
        passportPhotoUrl: "Placeholder",
        schoolName: options.schoolName,
        schoolTown: options.schoolTown,
        schoolLga: options.schoolLga,
        schoolState: options.schoolState,
        currentClass: options.currentClass,
        classPositionLastTerm: options.classPositionLastTerm,
        lastResultUrl: "Placeholder",
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
        parentSignatureUrl: "Placeholder",
        assignedMentor: options.assignedMentor,
        pretestScore: options.pretestScore,
      });
    };
    