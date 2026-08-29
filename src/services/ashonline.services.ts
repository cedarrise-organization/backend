import { uploadToCloudinary } from "../utils/storage.util.js";
import { addAssetToDeletionQueue } from "../queues/deleteCloudinaryAsset.queue.js";
import { CACHE_TTL, cacheSet, cacheGet } from "../lib/cache.js";
import { ASH_EVENTS } from "../events/ash.events.js";
import { UploadApiResponse } from "cloudinary";
import { appEvents } from "../lib/events.js";
import { sql, asc, and, eq, count, desc } from "drizzle-orm";
import { Request } from "express";
import { AshOnlineRegistrationBodyType } from "../modules/ashonline/ashonline.schema.js";
import { ashOnlineRegistration } from "../db/models/admin.js";
import db from "../db/db.js";
import logger from "../configs/logger.config.js";

const sortMap = {
  childFirstName: ashOnlineRegistration.childFirstName,
  childSurname: ashOnlineRegistration.childSurname,
  childClass: ashOnlineRegistration.childClass,
  childEmail: ashOnlineRegistration.childEmail,
  schoolName: ashOnlineRegistration.schoolName,
  tutoringDays: ashOnlineRegistration.tutoringDays,
  timeAvailability: ashOnlineRegistration.timeAvailability,
  createdAt: ashOnlineRegistration.createdAt,
} as const;

// ASH ONLINE REGISTRATION
export const submitAshOnlineRegistration = async (
  req: Request,
  options: AshOnlineRegistrationBodyType,
  correlationId: string,
) => {
  const files = req.files as {
    currentCurriculum?: Express.Multer.File[];
    academicReport?: Express.Multer.File[];
  };

  const curriculumFile = files.currentCurriculum?.[0];
  const reportFile = files.academicReport?.[0];

  const curriculumUpload: UploadApiResponse | undefined | null = curriculumFile
    ? await uploadToCloudinary(
        curriculumFile,
        "/Cedarrise Initiative/ASH-ONLINE-ASSETS/CURRICULUMS",
      )
    : null;

  const reportUpload: UploadApiResponse | undefined | null = reportFile
    ? await uploadToCloudinary(reportFile, "/Cedarrise Initiative/ASH-ONLINE-ASSETS/REPORTS")
    : null;

  const [newRegistration] = await db
    .insert(ashOnlineRegistration)
    .values({
      childFirstName: options.childFirstName,
      childSurname: options.childSurname,
      dob: sql`TO_DATE(${options.dob}, 'YYYY-MM-DD')`,
      age: options.age,
      childClass: options.childClass,
      schoolName: options.schoolName,
      schoolLocation: options.schoolLocation,
      childEmail: options.childEmail,
      tutoringDays: options.tutoringDays,
      timeAvailability: options.timeAvailability,
      subjectsOfInterest: options.subjectsOfInterest,
      currentCurriculumUrl: curriculumUpload ? curriculumUpload.secure_url : null,
      currentCurriculumPublicId: curriculumUpload ? curriculumUpload.public_id : null,
      academicReportUrl: reportUpload ? reportUpload.secure_url : null,
      academicReportPublicId: reportUpload ? reportUpload.public_id : null,
      prevTermClassAverage: options.prevTermClassAverage,
      prevTermClassPosition: options.prevTermClassPosition,
      parentName: options.parentName,
      parentPhone: options.parentPhone,
      parentEmail: options.parentEmail,
      parentalConsent: options.parentalConsent,
    })
    .returning();

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ashonline:registrations:*`,
    event: "ASH ONLINE REGISTRATION FORM SUBMIT",
    correlationId,
  });

  return {
    code: 201,
    message: "ASH Online registration form submitted successfully",
    data: newRegistration,
    meta: {
      correlationId,
    },
  };
};

export const listAshOnlineRegistrations = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  status: string,
  sortBy: keyof typeof sortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${ashOnlineRegistration.childFirstName}), 'A') ||
      setweight(to_tsvector('english', ${ashOnlineRegistration.childSurname}), 'A') ||
      setweight(to_tsvector('english', ${ashOnlineRegistration.childClass}), 'B') ||
      setweight(to_tsvector('english', ${ashOnlineRegistration.childEmail}), 'B') ||
      setweight(to_tsvector('english', ${ashOnlineRegistration.schoolName}), 'B') ||
      setweight(to_tsvector('english', ${ashOnlineRegistration.timeAvailability}), 'B') ||
      setweight(to_tsvector('english', array_to_string(${ashOnlineRegistration.tutoringDays}, ' ')), 'C')
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [registrations, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(ashOnlineRegistration)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(ashOnlineRegistration.id) })
        .from(ashOnlineRegistration)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "ASH Online registrations found successfully",
      data: registrations,
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
  const key = `cedarrise:ashonline:registrations:${page}:${limit}:${orderBy}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "ASH Online registrations found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        metadata: cacheRes.metadata,
        correlationId,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? ashOnlineRegistration.createdAt;
  const orderby =
    sortColumn === ashOnlineRegistration.createdAt
      ? [
          sql`
          CASE
            WHEN ${ashOnlineRegistration.status} = ${status} THEN 0
            ELSE 1
          END
        `,
          desc(ashOnlineRegistration.createdAt),
        ]
      : [
          sql`
          CASE
            WHEN ${ashOnlineRegistration.status} = ${status} THEN 0
            ELSE 1
          END
        `,
          sortDirection(sortColumn),
          desc(ashOnlineRegistration.createdAt),
        ];

  const [registrations, [totalDocuments], [metaData]] = await Promise.all([
    db
      .select()
      .from(ashOnlineRegistration)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(ashOnlineRegistration.id) }).from(ashOnlineRegistration),
    db
      .select({
        acceptedStudents: sql<number>`
      COUNT(${ashOnlineRegistration.id}) FILTER (WHERE ${ashOnlineRegistration.status} = 'accepted')
    `,
        rejectedStudents: sql<number>`
      COUNT(${ashOnlineRegistration.id}) FILTER (WHERE ${ashOnlineRegistration.status} = 'rejected')
    `,
        pendingStudents: sql<number>`
      COUNT(${ashOnlineRegistration.id}) FILTER (WHERE ${ashOnlineRegistration.status} = 'pending')
    `,
      })
      .from(ashOnlineRegistration),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(
    key,
    {
      data: registrations,
      totalPages,
      metadata: {
        totalSubmissions: Number(totalDocuments?.value ?? 0),
        acceptedStudents: Number(metaData?.acceptedStudents ?? 0),
        rejectedStudents: Number(metaData?.rejectedStudents ?? 0),
        pendingStudents: Number(metaData?.pendingStudents ?? 0),
      },
    },
    CACHE_TTL.FORM_DATA,
  );
  ///

  return {
    code: 200,
    message: "ASH Online registrations found successfully",
    data: registrations,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      metadata: {
        totalSubmissions: Number(totalDocuments?.value ?? 0),
        acceptedStudents: Number(metaData?.acceptedStudents ?? 0),
        rejectedStudents: Number(metaData?.rejectedStudents ?? 0),
        pendingStudents: Number(metaData?.pendingStudents ?? 0),
      },
      correlationId,
    },
  };
};

export const getAshOnlineRegistration = async (id: string) => {
  /// cache
  const key = `cedarrise:ashonline:registrations:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "ASH Online registration found successfully",
      data: cacheRes,
    };
  }
  ///

  const [registration] = await db
    .select()
    .from(ashOnlineRegistration)
    .where(eq(ashOnlineRegistration.id, id));

  /// cache set
  await cacheSet(key, registration, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "ASH Online registration found successfully",
    data: registration,
  };
};

export const updateAshOnlineStudentStatus = async (
  id: string,
  status: string,
  correlationId: string,
) => {
  const [updatedStudent] = await db
    .update(ashOnlineRegistration)
    .set({
      status,
    })
    .where(eq(ashOnlineRegistration.id, id))
    .returning({
      id: ashOnlineRegistration.id,
      status: ashOnlineRegistration.status,
      name: ashOnlineRegistration.childFirstName,
      email: ashOnlineRegistration.childEmail,
    });

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ashonline:registrations:*`,
    event: "UPDATE ASH ONLINE STUDENT STATUS",
    correlationId,
  });

  // emitter to send email on accept or reject
  if (status === "accepted") {
    appEvents.emit(ASH_EVENTS.ONLINE_STUDENT_ACCEPTED, {
      name: updatedStudent?.name,
      userId: updatedStudent?.id,
      email: updatedStudent?.email,
      correlationId,
    });
  } else if (status === "rejected") {
    appEvents.emit(ASH_EVENTS.ONLINE_STUDENT_REJECTED, {
      name: updatedStudent?.name,
      userId: updatedStudent?.id,
      email: updatedStudent?.email,
      correlationId,
    });
  }

  return {
    code: 200,
    message: "ASH Online student status updated successfully",
    data: updatedStudent,
    meta: {
      correlationId,
    },
  };
};

export const deleteAshOnlineRegistration = async (id: string, correlationId: string) => {
  const [data] = await db
    .delete(ashOnlineRegistration)
    .where(eq(ashOnlineRegistration.id, id))
    .returning({
      currentCurriculumPublicId: ashOnlineRegistration.currentCurriculumPublicId,
      academicReportPublicId: ashOnlineRegistration.academicReportPublicId,
    });

  appEvents.emit(ASH_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:ashonline:registrations:*`,
    event: "DELETE ASH ONLINE REGISTRATION RECORD",
    correlationId,
  });

  if (data?.currentCurriculumPublicId) {
    try {
      await addAssetToDeletionQueue(data.currentCurriculumPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add current curriculum public id to queue`, {
        user: id,
      });
    }
  }

  if (data?.academicReportPublicId) {
    try {
      await addAssetToDeletionQueue(data.academicReportPublicId, "image", id, correlationId);
    } catch (error) {
      logger.error(`Could not add academic report public id to queue`, {
        user: id,
      });
    }
  }

  return {
    code: 200,
    message: "ASH Online registration data deleted successfully",
    meta: {
      correlationId,
    },
  };
};

export const exportAshOnlineStudentTableToCSV = async () => {
  const data = await db.select().from(ashOnlineRegistration);
  return data;
};
