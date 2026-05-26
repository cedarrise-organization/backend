import { OutreachtrackerbodyType } from "../modules/outreaches/outreaches.schema.js";
import { cacheGet, cacheDel, cacheSet, CACHE_TTL } from "../lib/cache.js";
import {
  uploadToCloudinary,
  searchCloudinary,
  deleteFromCloudinary,
} from "../utils/storage.util.js";
import { outreachTracker } from "../db/models/admin.js";
import { UploadApiResponse } from "cloudinary";
import { Request } from "express";
import { sql, asc, eq } from "drizzle-orm";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";

export const createOutreach = async (req: Request, options: OutreachtrackerbodyType) => {
  const documentUpload: UploadApiResponse | undefined = await uploadToCloudinary(
    (req as any).file,
    "./",
  );

  if (!documentUpload) {
    throw new Error(`Could not upload document`);
  }

  const [outreach] = await db
    .insert(outreachTracker)
    .values({
      id: sql`uuid_generate_v4()`,
      outreachStartDate: sql`TO_DATE(${options.outreachStartDate}, YYYY-MM-DD)`,
      outreachEndDate: sql`TO_DATE(${options.outreachEndDate}, YYYY-MM-DD)`,
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
      submissionDate: sql`TO_DATE(${options.submissionDate}, YYYY-MM-DD)`,
      documentationUrl: documentUpload.secure_url,
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

export const listOutreaches = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:outreaches:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Outreaches found successfully",
      data: cacheRes,
      meta: {
        pagination: {
          page,
          limit,
        },
      },
    };
  }
  ///

  const outreaches = await db
    .select()
    .from(outreachTracker)
    .orderBy(asc(outreachTracker.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  /// cache set
  await cacheSet(key, outreaches, CACHE_TTL.FORM_DATA);
  ///

  return {
    code: 200,
    message: "Outreaches found successfully",
    data: outreaches,
    meta: {
      pagination: {
        page,
        limit,
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
  const search = await searchCloudinary('placholder', 1)

  if (!search) {
    throw new Error("Document not found");
  }

  const deleteResponse = await deleteFromCloudinary(search[0]!.public_id, "image");

  if (deleteResponse.result !== "ok") {
    logger.error("Document was not deleted from s3", {
      publicId: search[0]!.public_id,
      event: "delete_doc",
    });
  }

  await db.delete(outreachTracker).where(eq(outreachTracker.id, id));

  /// cache Del
  await cacheDel(`cedarrise:outreaches:outreach:${id}`);
  ///

  return {
    code: 200,
    message: "Outreach deleted successfully",
  };
};
