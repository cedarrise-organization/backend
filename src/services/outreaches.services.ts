import { OutreachtrackerbodyType } from "../modules/outreaches/outreaches.schema.js";
import { cacheGet, cacheDel, cacheSet, CACHE_TTL } from "../lib/cache.js";
import { outreachTracker } from "../db/models/admin.js";
import { invalidateCache } from "../utils/cache.util.js";
import { max, sum, sql, asc, desc, eq, count, countDistinct } from "drizzle-orm";
import db from "../db/db.js";

const sortMap = {
  outreachStartDate: outreachTracker.outreachStartDate,
  outreachEndDate: outreachTracker.outreachEndDate,
  outreachState: outreachTracker.outreachState,
  outreachType: outreachTracker.outreachType,
  createdAt: outreachTracker.createdAt,
} as const;

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

  /// delete related cache
  await invalidateCache(undefined, `cedarrise:outreaches:*`);
  /// cache set
  await cacheSet(`cedarrise:outreaches:outreach:${outreach?.id}`, outreach, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 201,
    message: "Outreach tracker created successfully",
    data: outreach,
  };
};
export const getOutreachCardsData = async () => {
  /// cache
  const key = "cedarrise:outreachcardsdata";
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return cacheRes;
  }
  ///
  const [
    [outreachesCommunitiesEngaged],
    [outreachesBeneficiariesReached],
    [outreachesVolunteers],
    [outreachesOutreachEvents],
  ] = await Promise.all([
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
  ]);

  /// cache set
  await cacheSet(
    key,
    {
      communitiesEngaged: Number(outreachesCommunitiesEngaged?.value ?? 0),
      beneficiariesReached: Number(outreachesBeneficiariesReached?.value ?? 0),
      volunteers: Number(outreachesVolunteers?.value ?? 0),
      outreachEvents: Number(outreachesOutreachEvents?.value ?? 0),
    },
    CACHE_TTL.DASHBOARD_CARDS,
  );

  return {
    communitiesEngaged: Number(outreachesCommunitiesEngaged?.value ?? 0),
    beneficiariesReached: Number(outreachesBeneficiariesReached?.value ?? 0),
    volunteers: Number(outreachesVolunteers?.value ?? 0),
    outreachEvents: Number(outreachesOutreachEvents?.value ?? 0),
  };
};
export const listOutreaches = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof sortMap,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${outreachTracker.submittedBy}), 'A') ||
      setweight(to_tsvector('english', array_to_string(${outreachTracker.outreachType}, ' ')), 'A') ||
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
  const key = `cedarrise:outreaches:${page}:${limit}:${orderBy}:${sortBy}`;
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
        metadata: cacheRes.metadata,
      },
    };
  }
  ///

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? outreachTracker.createdAt;
  const orderby =
    sortColumn === outreachTracker.createdAt
      ? [desc(outreachTracker.createdAt)]
      : [sortDirection(sortColumn), desc(outreachTracker.createdAt)];

  const [outreaches, [totalDocuments], metaData] = await Promise.all([
    db
      .select()
      .from(outreachTracker)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(outreachTracker.id) }).from(outreachTracker),
    getOutreachCardsData(),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: outreaches, totalPages, metadata: metaData }, CACHE_TTL.FORM_DATA);
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
      metadata: metaData,
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
