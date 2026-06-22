import { cacheGet, cacheSet } from "../lib/cache.js";
import { CACHE_TTL } from "../lib/cache.js";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import {
  ashStudent,
  ashExit,
  tacotsRecommendation,
  tacotsOnboarding,
  volunteerRegistration,
  tacotsExit,
} from "../db/models/admin.js";
import db from "../db/db.js";

export const ashDropdown = async () => {
  /// cache
  const key = `cedarrise:lookup:ash`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes,
    };
  }
  ///

  const students = await db
    .select({
      id: ashStudent.id,
      firstName: ashStudent.firstName,
      surname: ashStudent.surname,
      status: ashStudent.status,
    })
    .from(ashStudent)
    .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
    .where(and(eq(ashStudent.status, "accepted"), isNull(ashExit.studentId)));

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
      status: student.status,
    };
  });

  /// cache set
  await cacheSet(key, returnStudents, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
  };
};

export const recommendedDropdown = async () => {
  /// cache
  const key = `cedarrise:lookup:recommended`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes,
    };
  }
  ///

  const students = await db
    .select({
      id: tacotsRecommendation.id,
      firstName: tacotsRecommendation.firstName,
      surname: tacotsRecommendation.surname,
      status: tacotsRecommendation.adminStatus,
    })
    .from(tacotsRecommendation)
    .leftJoin(tacotsOnboarding, eq(tacotsOnboarding.studentId, tacotsRecommendation.id))
    .where(
      and(eq(tacotsRecommendation.adminStatus, "SELECTED"), isNull(tacotsOnboarding.studentId)),
    );

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
      status: student.status,
    };
  });

  /// cache set
  await cacheSet(key, returnStudents, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
  };
};

export const onboardedDropdown = async () => {
  /// cache
  const key = `cedarrise:lookup:onboarded`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes,
    };
  }
  ///
  const students = await db
    .select({
      id: tacotsOnboarding.id,
      firstName: tacotsRecommendation.firstName,
      surname: tacotsRecommendation.surname,
    })
    .from(tacotsOnboarding)
    .innerJoin(
      tacotsRecommendation,
      and(
        eq(tacotsRecommendation.id, tacotsOnboarding.studentId),
        eq(tacotsRecommendation.adminStatus, "SELECTED"),
      ),
    )
    .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id))
    .where(isNull(tacotsExit.studentId));

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
    };
  });

  /// cache set
  await cacheSet(key, students, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
  };
};

export const volunteerDropdown = async () => {
  /// cache
  const key = `cedarrise:lookup:volunteers`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes,
    };
  }
  ///

  const students = await db
    .select({
      id: volunteerRegistration.id,
      firstName: volunteerRegistration.firstName,
      surname: volunteerRegistration.surname,
      status: volunteerRegistration.status,
    })
    .from(volunteerRegistration)
    .where(eq(volunteerRegistration.status, "accepted"));

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
      status: student.status,
    };
  });

  /// cache set
  await cacheSet(key, returnStudents, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
  };
};

export const example = async () => {};
