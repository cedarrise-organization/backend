import { OutreachtrackerbodyType } from "../modules/outreaches/outreaches.schema.js";
import { cacheGet, cacheDel, cacheSet, CACHE_TTL } from "../lib/cache.js";
import { outreachTracker } from "../db/models/admin.js";
import { sql, asc, eq, count } from "drizzle-orm";
import db from "../db/db.js";

export const createOutreach = async (options: OutreachtrackerbodyType) => {
  const [outreach] = await db
    .insert(outreachTracker)
    .values({
      outreachStartDate: sql`TO_DATE(${options.outreachStartDate}, 'YYYY-MM-DD')`,
      outreachEndDate: sql`TO_DATE(${options.outreachEndDate}, 'YYYY-MM-DD')`,
      outreachState: options.outreachState,
      outreachLga: options.outreachLga,
      outreachCity: options.outreachCity,
      outreachCommunity: options.outreachCommunity,
      numVolunteers: options.numVolunteers,
      numBeneficiaries: options.numBeneficiaries,
      outreachType: options.outreachType,
      activityDescription: options.activityDescription,
      impactStories: options.impactStories,
      challengesEncountered: options.challengesEncountered,
      recommendations: options.recommendations,
      submittedBy: options.submittedBy,
      submissionDate: sql`TO_DATE(${options.submissionDate}, 'YYYY-MM-DD')`,
    })
    .returning();

  /// cache set
  await cacheSet(`cedarrise:outreaches:outreach:${outreach?.id}`, outreach, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 201,
    message: "Outreach tracker created successfully",
    data: outreach,
  };
};
export const listOutreaches = async (page: number, limit: number, search: string) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${outreachTracker.submittedBy}), 'A') ||
      setweight(to_tsvector('english', ${outreachTracker.outreachType}), 'A') ||
      setweight(to_tsvector('english', ${outreachTracker.outreachState}), 'A') ||
      setweight(to_tsvector('english', ${outreachTracker.outreachCommunity}), 'A') ||
      setweight(to_tsvector('english', ${outreachTracker.outreachCity}), 'B') ||
      setweight(to_tsvector('english', ${outreachTracker.outreachLga}), 'B') 
  `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [outreaches, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(outreachTracker)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(outreachTracker.id) })
        .from(outreachTracker)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Outreaches found successfully",
      data: outreaches,
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
  const key = `cedarrise:outreaches:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Outreaches found successfully",
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

  const [outreaches, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(outreachTracker)
      .orderBy(asc(outreachTracker.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(outreachTracker.id) }).from(outreachTracker),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: outreaches, totalPages }, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Outreaches found successfully",
    data: outreaches,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
    },
  };
};
export const getOneOutreach = async (id: string) => {
  /// cache
  const key = `cedarrise:outreaches:outreach:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Outreachfound successfully",
      data: cacheRes,
    };
  }
  ///

  const [outreach] = await db.select().from(outreachTracker).where(eq(outreachTracker.id, id));

  /// cache set
  await cacheSet(key, outreach, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Outreach found successfully",
    data: outreach,
  };
};
export const deleteOutreach = async (id: string) => {
  const [search] = await db.select().from(outreachTracker).where(eq(outreachTracker.id, id));

  await db.delete(outreachTracker).where(eq(outreachTracker.id, id));

  /// cache Del
  await cacheDel(`cedarrise:outreaches:outreach:${id}`);
  ///

  return {
    code: 200,
    message: "Outreach deleted successfully",
  };
};
export const exportOutreachTrackerTableToCSV = async () => {
  const data = await db.select().from(outreachTracker);
  return data;
};
