import { volunteerRegistration, volunteerFeedback } from "../db/models/admin.js";
import { cacheSet, cacheGet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import { VOLUNTEER_EVENTS } from "../events/volunteer.events.js";
import { invalidateCache } from "../utils/cache.util.js";
import { sql, asc, desc, eq, count } from "drizzle-orm";
import {
  VolunteerregistrationbodyType,
  VolunteerfeedbackbodyType,
} from "../modules/volunteer/volunteer.schema.js";
import { appEvents } from "../lib/events.js";
import db from "../db/db.js";

const sortMap = {
  firstName: volunteerRegistration.firstName,
  surname: volunteerRegistration.surname,
  emailAddress: volunteerRegistration.emailAddress,
  phoneNumber: volunteerRegistration.phoneNumber,
  state: volunteerRegistration.state,
  volunteerAreas: volunteerRegistration.volunteerAreas,
  createdAt: volunteerRegistration.createdAt,
} as const;

export const submitVolunteerRegistration = async (options: VolunteerregistrationbodyType) => {
  const [newVolunteerSubmission] = await db
    .insert(volunteerRegistration)
    .values({
      id: sql`uuid_generate_v4()`,
      firstName: options.firstName,
      middleName: options.middleName,
      surname: options.surname,
      gender: options.gender,
      dob: sql`TO_DATE(${options.dob}, 'YYYY-MM-DD')`,
      age: options.age,
      phoneNumber: options.phoneNumber,
      emailAddress: options.emailAddress,
      homeAddress: options.homeAddress,
      city: options.city,
      state: options.state,
      occupation: options.occupation,
      highestEducation: options.highestEducation,
      reasonForVolunteering: options.reasonForVolunteering,
      volunteerAreas: options.volunteerAreas,
      skillsToContribute: options.skillsToContribute,
      availability: options.availability,
      commitmentDuration: options.commitmentDuration,
      ashSaturdayAvailability: options.ashSaturdayAvailability,
      ashAcademicArea: options.ashAcademicArea,
      ashExtracurricular: options.ashExtracurricular,
      safeguardingAgreement: options.safeguardingAgreement,
      mediaConsent: options.mediaConsent,
      additionalInfo: options.additionalInfo,
    })
    .returning();

  appEvents.emit(VOLUNTEER_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:volunteer:*`,
    affectedService: "SUBMIT VOLUNTEER REGISTRATION FORM",
  });

  return {
    code: 201,
    message: "Volunteer registration form submitted successfully",
    data: newVolunteerSubmission,
  };
};
export const listVolunteers = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  status: string,
  sortBy: keyof typeof sortMap,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${volunteerRegistration.firstName}), 'A') ||
      setweight(to_tsvector('english', ${volunteerRegistration.surname}), 'A') ||
      setweight(to_tsvector('english', ${volunteerRegistration.emailAddress}), 'A') ||
      setweight(to_tsvector('english', ${volunteerRegistration.phoneNumber}), 'B') ||
      setweight(to_tsvector('english', ${volunteerRegistration.state}), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${volunteerRegistration.skillsToContribute}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${volunteerRegistration.ashExtracurricular}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', array_to_string(${volunteerRegistration.volunteerAreas}, ' ')), 'C')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [volunteers, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(volunteerRegistration)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ value: count(volunteerRegistration.id) })
        .from(volunteerRegistration)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Volunteers found successfully",
      data: volunteers,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  /// cache
  const key = `cedarrise:volunteer:volunteers:${page}:${limit}:${orderBy}:${status}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteers found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        metadata: cacheRes.metadata,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? volunteerRegistration.createdAt;
  const orderby =
    sortColumn === volunteerRegistration.createdAt
      ? [
          sql`
            CASE
              WHEN ${volunteerRegistration.status} = ${status} THEN 0
              ELSE 1
            END
          `,
          desc(volunteerRegistration.createdAt),
        ]
      : [
          sql`
            CASE
              WHEN ${volunteerRegistration.status} = ${status} THEN 0
              ELSE 1
            END
          `,
          sortDirection(sortColumn),
          desc(volunteerRegistration.createdAt),
        ];
  const [volunteers, [totalDocuments], [metaData]] = await Promise.all([
    db
      .select()
      .from(volunteerRegistration)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(volunteerRegistration.id) }).from(volunteerRegistration),
    db
      .select({
        acceptedStudents: sql<number>`
          COUNT(${volunteerRegistration.id}) FILTER (WHERE ${volunteerRegistration.status} = 'accepted')
        `,
        rejectedStudents: sql<number>`
          COUNT(${volunteerRegistration.id}) FILTER (WHERE ${volunteerRegistration.status} = 'rejected')
        `,
        pendingStudents: sql<number>`
          COUNT(${volunteerRegistration.id}) FILTER (WHERE ${volunteerRegistration.status} = 'pending')
        `,
      })
      .from(volunteerRegistration),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(
    key,
    {
      data: volunteers,
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
    message: "Volunteers found successfully",
    data: volunteers,
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
    },
  };
};
export const getVolunteer = async (id: string) => {
  /// cache
  const key = `cedarrise:volunteer:voluntee:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteer found successfully",
      data: cacheRes,
    };
  }
  ///

  const [volunteer] = await db
    .select()
    .from(volunteerRegistration)
    .where(eq(volunteerRegistration.id, id));

  /// cache set
  await cacheSet(key, volunteer, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Volunteer found successfully",
    data: volunteer,
  };
};
export const updateVolunteerStatus = async (id: string, status: string) => {
  // update
  const [updatedVolunteer] = await db
    .update(volunteerRegistration)
    .set({
      status,
    })
    .where(eq(volunteerRegistration.id, id))
    .returning({
      id: volunteerRegistration.id,
      status: volunteerRegistration.status,
      name: volunteerRegistration.firstName,
      email: volunteerRegistration.emailAddress,
      volunteerAreas: volunteerRegistration.volunteerAreas,
    });

  if (status === "accepted") {
    appEvents.emit(VOLUNTEER_EVENTS.VOLUNTEER_ACCEPTED, {
      name: updatedVolunteer?.name,
      userId: updatedVolunteer?.id,
      email: updatedVolunteer?.email,
      volunteerAreas: updatedVolunteer?.volunteerAreas,
    });
  } else if (status === "rejected") {
    appEvents.emit(VOLUNTEER_EVENTS.VOLUNTEER_REJECTED, {
      name: updatedVolunteer?.name,
      userId: updatedVolunteer?.id,
      email: updatedVolunteer?.email,
    });
  }

  appEvents.emit(VOLUNTEER_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:volunteer:*`,
    affectedService: "UPDATE VOLUNTEER STATUS",
  });

  return {
    code: 200,
    message: "Volunteer status updated successfully",
    data: updatedVolunteer,
  };
};
export const deleteVolunteer = async (id: string) => {
  await db.delete(volunteerRegistration).where(eq(volunteerRegistration.id, id));

  appEvents.emit(VOLUNTEER_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:volunteer:*`,
    affectedService: "DELETE VOLUNTEER REGISTRATION RECORD",
  });

  return {
    code: 200,
    message: "volunteer data deleted successfully",
  };
};
export const exportVolunteerRegistrationTableToCSV = async () => {
  const data = await db.select().from(volunteerRegistration);
  return data;
};

export const submitVolunteerFeedback = async (options: VolunteerfeedbackbodyType) => {
  const [newVolunteerFeedback] = await db
    .insert(volunteerFeedback)
    .values({
      id: sql`uuid_generate_v4()`,
      firstName: options.firstName,
      surname: options.surname,
      programVolunteered: options.programVolunteered,
      specificProgramDetails: options.specificProgramDetails,
      volunteerDuration: options.volunteerDuration,
      overallExperienceRating: options.overallExperienceRating,
      roleClarityRating: options.roleClarityRating,
      teamSupportRating: options.teamSupportRating,
      organizationRating: options.organizationRating,
      programMadeImpact: options.programMadeImpact,
      waysProgramHelped: options.waysProgramHelped,
      activitiesInvolvedIn: options.activitiesInvolvedIn,
      skillsDeveloped: options.skillsDeveloped,
      skillsGained: options.skillsGained,
      enjoyedMost: options.enjoyedMost,
      challengesExperienced: options.challengesExperienced,
      improvementSuggestions: options.improvementSuggestions,
      continueVolunteering: options.continueVolunteering,
      wouldRecommend: options.wouldRecommend,
      additionalComments: options.additionalComments,
      submissionDate: sql`TO_DATE(${options.submissionDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  appEvents.emit(VOLUNTEER_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:feedback:*`,
    affectedService: "SUBMIT VOLUNTEER FEEDBACK FORM",
  });

  return {
    code: 201,
    message: "Volunteer Feedback form submitted successfully",
    data: newVolunteerFeedback,
  };
};
export const listVolunteerFeedback = async (page: number, limit: number, search: string) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${volunteerFeedback.firstName}), 'A') ||
      setweight(to_tsvector('english', ${volunteerFeedback.surname}), 'A') ||
      setweight(to_tsvector('english', ${volunteerFeedback.programVolunteered}), 'A') ||
      setweight(to_tsvector('english', coalesce(${volunteerFeedback.volunteerDuration}, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${volunteerFeedback.waysProgramHelped}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${volunteerFeedback.activitiesInvolvedIn}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', coalesce(array_to_string(${volunteerFeedback.skillsGained}, ' '), '')), 'C') ||
      setweight(to_tsvector('english', coalesce(${volunteerFeedback.wouldRecommend}, '')), 'D')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [feedback, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(volunteerFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ value: count(volunteerFeedback.id) })
        .from(volunteerFeedback)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Volunteer feedback successfully",
      data: feedback,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  /// cache
  const key = `cedarrise:volunteer:feedback:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Volunteer feedback successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
      },
    };
  }
  ///

  const [feedback, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(volunteerFeedback)
      .orderBy(desc(volunteerFeedback.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(volunteerFeedback.id) }).from(volunteerFeedback),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: feedback, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Volunteer feedback successfully",
    data: feedback,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
    },
  };
};
export const getVolunteerFeedback = async (id: string) => {
  /// cache
  const key = `cedarrise:volunteer:feedback:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Single volunteer feedback found successfully",
      data: cacheRes,
    };
  }
  ///

  const [feedback] = await db.select().from(volunteerFeedback).where(eq(volunteerFeedback.id, id));

  /// cache set
  await cacheSet(key, feedback, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Single volunteer feedback found successfully",
    data: feedback,
  };
};
export const deleteVolunteerFeedback = async (id: string) => {
  await db.delete(volunteerFeedback).where(eq(volunteerFeedback.id, id));

  appEvents.emit(VOLUNTEER_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:feedback:*`,
    affectedService: "DELETE VOLUNTEER FEEDBACK RECORD",
  });

  return {
    code: 200,
    message: "volunteer feedback deleted successfully",
  };
};
export const exportVolunteerFeedbackTableToCSV = async () => {
  const data = await db.select().from(volunteerFeedback);
  return data;
};
