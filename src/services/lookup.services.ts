import { cacheGet, cacheSet, CACHE_TTL } from "../lib/cache.js";
import { eq, and, sql, asc, desc, isNull, count } from "drizzle-orm";
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
      schoolName: tacotsRecommendation.schoolName,
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
      schoolName: student.schoolName,
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

// FOR ASH STUDENT PROFILE
export const ashProfileDropdown = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  correlationId: string,
) => {
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${ashStudent.firstName}), 'A') ||
      setweight(to_tsvector('english', ${ashStudent.surname}), 'A') 
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [students, [totalDocuments]] = await Promise.all([
      db
        .select({
          id: ashStudent.id,
          firstName: ashStudent.firstName,
          surname: ashStudent.surname,
        })
        .from(ashStudent)
        .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
        .where(sql`${searchVector} @@ ${searchQuery}`),

      db
        .select({ value: count(ashStudent.id) })
        .from(ashStudent)
        .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "students found successfully",
      data: students,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }
  /// cache
  const key = `cedarrise:lookup:ashstudents:${page}:${limit}:${orderBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///
  const sortDirection = orderBy === "asc" ? asc : desc;

  const [students, [totalDocuments]] = await Promise.all([
    db
      .select({
        id: ashStudent.id,
        firstName: ashStudent.firstName,
        surname: ashStudent.surname,
      })
      .from(ashStudent)
      .orderBy(sortDirection(ashStudent.firstName))
      .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
      .where(eq(ashStudent.status, "accepted"))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ value: count(ashStudent.id) })
      .from(ashStudent)
      .leftJoin(ashExit, eq(ashExit.studentId, ashStudent.id))
      .where(eq(ashStudent.status, "accepted")),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
    };
  });

  /// cache set
  await cacheSet(key, { data: returnStudents, totalPages }, CACHE_TTL.STUDENT_PROFILE);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
    },
  };
};

// FOR TACOTS STUDENT PROFILE
export const tacotsProfileDropdown = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  correlationId: string,
) => {
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${tacotsRecommendation.firstName}), 'A') ||
      setweight(to_tsvector('english', ${tacotsRecommendation.surname}), 'A') 
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;
    const [students, [totalDocuments]] = await Promise.all([
      db
        .select({
          id: tacotsRecommendation.id,
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
        .where(sql`${searchVector} @@ ${searchQuery}`),
      db
        .select({ value: count(tacotsRecommendation.id) })
        .from(tacotsOnboarding)
        .innerJoin(
          tacotsRecommendation,
          and(
            eq(tacotsRecommendation.id, tacotsOnboarding.studentId),
            eq(tacotsRecommendation.adminStatus, "SELECTED"),
          ),
        )
        .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id))
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);

    const totalPages = Math.ceil(totalDocuments!.value / limit);
    return {
      code: 200,
      message: "students found successfully",
      data: students,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:lookup:tacotsstudents:${page}:${limit}:${orderBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "students found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const [students, [totalDocuments]] = await Promise.all([
    db
      .select({
        id: tacotsRecommendation.id,
        firstName: tacotsRecommendation.firstName,
        surname: tacotsRecommendation.surname,
      })
      .from(tacotsOnboarding)
      .orderBy(sortDirection(tacotsRecommendation.firstName))
      .innerJoin(
        tacotsRecommendation,
        and(
          eq(tacotsRecommendation.id, tacotsOnboarding.studentId),
          eq(tacotsRecommendation.adminStatus, "SELECTED"),
        ),
      )
      .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ value: count(tacotsRecommendation.id) })
      .from(tacotsOnboarding)
      .innerJoin(
        tacotsRecommendation,
        and(
          eq(tacotsRecommendation.id, tacotsOnboarding.studentId),
          eq(tacotsRecommendation.adminStatus, "SELECTED"),
        ),
      )
      .leftJoin(tacotsExit, eq(tacotsExit.studentId, tacotsOnboarding.id)),
  ]);

  const totalPages = Math.ceil(totalDocuments!.value / limit);

  const returnStudents = students.map((student) => {
    return {
      id: student.id,
      name: `${student.firstName} ${student.surname}`,
    };
  });

  /// cache set
  await cacheSet(key, { data: returnStudents, totalPages }, CACHE_TTL.STUDENT_PROFILE);
  ///

  return {
    code: 200,
    message: "students found successfully",
    data: returnStudents,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
    },
  };
};

export const example = async () => {};
