import { cacheGet, cacheSet } from "../lib/cache.js";
import { CACHE_TTL } from "../lib/cache.js";
import { eq, and } from "drizzle-orm";
import {
  ashStudent,
  tacotsRecommendation,
  tacotsOnboarding,
  volunteerRegistration,
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
    .select({ id: ashStudent.id, name: ashStudent.firstName })
    .from(ashStudent)
    .where(eq(ashStudent.status, "accepted"));

  /// cache set
  await cacheSet(key, students, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: students,
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
    .select({ id: tacotsRecommendation.id, name: tacotsRecommendation.firstName })
    .from(tacotsRecommendation)
    .where(eq(tacotsRecommendation.adminStatus, "SELECTED"));

  /// cache set
  await cacheSet(key, students, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: students,
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
    .select({ id: tacotsOnboarding.id, name: tacotsRecommendation.firstName })
    .from(tacotsOnboarding)
    .innerJoin(
      tacotsRecommendation,
      and(
        eq(tacotsRecommendation.id, tacotsOnboarding.studentId),
        eq(tacotsRecommendation.adminStatus, "SELECTED"),
      ),
    );

  /// cache set
  await cacheSet(key, students, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: students,
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
    .select({ id: volunteerRegistration.id, name: volunteerRegistration.firstName })
    .from(volunteerRegistration)
    .where(eq(volunteerRegistration.status, "accepted"));

  /// cache set
  await cacheSet(key, students, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: students,
  };
};

export const example = async () => {};
