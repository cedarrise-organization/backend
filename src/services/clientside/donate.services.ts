import { appEvents } from "../../lib/events.js";
import { DONATE_EVENTS } from "../../events/donate.events.js";
import { callPaystackApi } from "../../lib/https/paystackClient.js";
import { cacheGet, cacheSet, CACHE_TTL } from "../../lib/cache.js";
import { invalidateCache } from "../../utils/cache.util.js";
import { eq, sql, count, asc, desc } from "drizzle-orm";
import { donors } from "../../db/models/donors.js";
import db from "../../db/db.js";

const sortMap = {
  name: donors.name,
  amount: donors.amount,
  email: donors.email,
  createdAt: donors.createdAt,
} as const;

export const initialtize = async (body: {
  amount: number;
  email: string;
  callback_url: string;
  metadata: { name: string; comment: string; supportAreas: string[] };
}) => {
  const { data } = await callPaystackApi("/transaction/initialize", {
    body,
    method: "POST",
  });

  return {
    code: 200,
    message: "Transaction initialized successfully",
    data,
  };
};

export const verifyTransaction = async (reference: string) => {
  const { data } = await callPaystackApi<any>(`/transaction/verify/${reference}`, {
    method: "GET",
  });

  if (data.data.status === "success") {
    // emitter should go in webhook too
    appEvents.emit(DONATE_EVENTS.DONATION_MADE, {
      amount: data.data.amount / 100,
      email: data.data.customer.email,
      name: data.data.metadata.name,
      comment: data.data.metadata.comment,
      supportAreas: data.data.metadata.supportAreas,
      metaData: {
        code: 200,
        message: "Transaction verified successfully",
        data,
      },
      // correlationId
    });
  }

  return {
    code: 200,
    message: "Donation+made+successfully",
    data,
  };
};

export const getDonationRecords = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof sortMap,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${donors.name}), 'A') ||
      setweight(to_tsvector('english', ${donors.email}), 'A') ||
      setweight(to_tsvector('english', coalesce(${donors.comment}, '')), 'C') 
  `;

    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    // plain text amount search
    const searchCondition = sql`
    (${searchVector} @@ ${searchQuery})
    OR (${donors.amount}::text ILIKE ${`%${search}%`})
  `;

    const [donations, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(donors)
        .where(searchCondition)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(donors.id) })
        .from(donors)
        .where(searchCondition),
    ]);

    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Found all donation records successfully",
      data: donations,
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

  ///
  const key = `cedarrise:clientside:donations:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Found all donation records successfully",
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
  const sortColumn = sortMap[sortBy] ?? donors.createdAt;
  const orderby =
    sortColumn === donors.createdAt
      ? [desc(donors.createdAt)]
      : [sortDirection(sortColumn), desc(donors.createdAt)];

  const [donations, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(donors)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(donors.id) }).from(donors),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  ///
  await cacheSet(key, { data: donations, totalPages }, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "Found all donation records successfully",
    data: donations,
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

export const exportDonorsTableToCSV = async () => {
  const data = await db.select().from(donors);
  return data;
};

export const deleteDonationRecords = async (id: string) => {
  await db.delete(donors).where(eq(donors.id, id));

  ///
  await invalidateCache(undefined, "cedarrise:clientside:donations:*");
  ///

  return {
    code: 200,
    message: "Donation record deleted successfully",
  };
};
