import { deleteFromCloudinary, uploadToCloudinary } from "../utils/storage.util.js";
import { googleForms, photoCount, receipts } from "../db/models/general.js";
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import { eq, lt, asc, sql, desc, count } from "drizzle-orm";
import { invalidateCache } from "../utils/cache.util.js";
import { projects } from "../db/models/dashboard.js";
import { UploadApiResponse } from "cloudinary";
import { appEvents } from "../lib/events.js";
import { users } from "../db/models/auth.js";
import { Request } from "express";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
import { GENERAL_EVENTS } from "../events/general.events.js";

const sortMap = {
  name: receipts.name,
  amount: receipts.amount,
  description: receipts.description,
  uploadedBy: receipts.uploadedBy,
  createdAt: receipts.createdAt,
} as const;

// PROJECTS
export const getProjects = async () => {
  ///
  const key = `cedarrise:dashboard:projects`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Found all projects successfully",
      data: cacheRes.data,
      meta: {
        ongoingProjectCount: cacheRes.ongoingProjectCount,
      },
    };
  }
  ///

  const [allProjects, [projectsCount]] = await Promise.all([
    db.select().from(projects).orderBy(desc(projects.createdAt), desc(projects.status)),
    db
      .select({ value: count(projects.id) })
      .from(projects)
      .where(eq(projects.status, "ongoing")),
  ]);

  ///
  await cacheSet(
    key,
    { data: allProjects, ongoingProjectCount: projectsCount!.value },
    CACHE_TTL.DASHBOARD_CARDS,
  );
  ///

  return {
    code: 200,
    message: "Found all projects successfully",
    data: allProjects,
    meta: {
      ongoingProjectCount: projectsCount!.value,
    },
  };
};
export const createProjects = async (
  req: Request,
  options: {
    title: string;
    description?: string;
  },
) => {
  if ((req as any).file) {
    const projectImage: UploadApiResponse | undefined = await uploadToCloudinary(
      (req as any).file,
      "/Cedarrise Initiative/DASHBOARD-ASSETS/PROJECTS",
    );

    const [newProject] = await db
      .insert(projects)
      .values({
        title: options.title,
        description: options.description,
        imageUrl: projectImage ? projectImage.secure_url : undefined,
        imagePublicId: projectImage ? projectImage.public_id : undefined,
      })
      .returning();

    ///
    await cacheDel("cedarrise:dashboard:projects");
    ///

    return {
      code: 200,
      message: "Project created successfully",
      data: newProject,
    };
  }

  const [newProject] = await db
    .insert(projects)
    .values({
      title: options.title,
      description: options.description,
    })
    .returning();

  ///
  await cacheDel("cedarrise:dashboard:projects");
  ///

  return {
    code: 200,
    message: "Project created successfully",
    data: newProject,
  };
};
export const updateProjectStatus = async (id: string, status: string) => {
  const [updatedProject] = await db
    .update(projects)
    .set({
      status,
    })
    .where(eq(projects.id, id))
    .returning();

  ///
  await cacheDel("cedarrise:dashboard:projects");
  ///

  return {
    code: 200,
    message: "Project status updated successfully",
    data: updatedProject,
  };
};
export const deleteProjects = async (req: Request, id: string) => {
  const [project] = await db
    .select({ publicId: projects.imagePublicId })
    .from(projects)
    .where(eq(projects.id, id));

  if (project?.publicId && project?.publicId !== "ongoing_project_result_raix7r") {
    const deleteResponse = await deleteFromCloudinary(project.publicId, "image");

    if (deleteResponse.result !== "ok") {
      logger.error("Project image was not deleted from s3", {
        publicId: project.publicId,
        event: "delete_project",
      });
    }
  }

  await db.delete(projects).where(eq(projects.id, id));

  ///
  await cacheDel("cedarrise:dashboard:projects");
  ///

  return {
    code: 200,
    message: "Project deleted successfully",
  };
};

// RECEIPTS
export const getReceipts = async (
  page: number,
  limit: number,
  orderBy: string,
  search: string,
  sortBy: keyof typeof sortMap,
) => {
  // search
  if (search) {
    const searchVector = sql`
    setweight(to_tsvector('english', ${receipts.name}), 'A') ||
    setweight(to_tsvector('english', ${receipts.uploadedBy}), 'A') ||
    setweight(to_tsvector('english', coalesce(${receipts.description}, '')), 'C') 
  `;

    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    // plain text amount search
    const searchCondition = sql`
    (${searchVector} @@ ${searchQuery})
    OR (${receipts.amount}::text ILIKE ${`%${search}%`})
  `;

    const [outreaches, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(receipts)
        .where(searchCondition)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(receipts.id) })
        .from(receipts)
        .where(searchCondition),
    ]);

    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Found all receipts successfully",
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

  ///
  const key = `cedarrise:general:receipts:${page}:${limit}:${orderBy}:${sortBy}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Found all receipts successfully",
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

  const sortDirection = orderBy === "asc" ? asc : desc;
  const sortColumn = sortMap[sortBy] ?? receipts.createdAt;
  const orderby =
    sortColumn === receipts.createdAt
      ? [desc(receipts.createdAt)]
      : [sortDirection(sortColumn), desc(receipts.createdAt)];

  const [allReceipts, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(receipts)
      .orderBy(...orderby)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(receipts.id) }).from(receipts),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  ///
  await cacheSet(key, { data: allReceipts, totalPages }, CACHE_TTL.DASHBOARD_CARDS);
  ///

  return {
    code: 200,
    message: "Found all receipts successfully",
    data: allReceipts,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
    },
  };
};
export const createReceipts = async (
  req: Request,
  options: {
    name: string;
    amount: number;
    description?: string;
  },
) => {
  const receiptImage: UploadApiResponse | undefined = await uploadToCloudinary(
    (req as any).file,
    "/Cedarrise Initiative/RECEIPTS",
  );

  if (!receiptImage) {
    throw new Error("Could not upload receipt image");
  }

  const [newReceipt] = await db
    .insert(receipts)
    .values({
      name: options.name,
      amount: options.amount,
      description: options.description,
      uploadedBy: (req as any).user.name,
      imageUrl: receiptImage.secure_url,
      imagePublicId: receiptImage.public_id,
    })
    .returning();

  ///
  await invalidateCache(undefined, "cedarrise:general:receipts:*");
  ///

  return {
    code: 200,
    message: "Receipt record created successfully",
    data: newReceipt,
  };
};
export const deleteReceipts = async (req: Request, id: string) => {
  const [receipt] = await db
    .select({ publicId: receipts.imagePublicId })
    .from(receipts)
    .where(eq(receipts.id, id));

  if (!receipt?.publicId) {
    throw new Error("receipt not found");
  }

  const deleteResponse = await deleteFromCloudinary(receipt.publicId, "image");

  if (deleteResponse.result !== "ok") {
    logger.error("Receipt image was not deleted from s3", {
      publicId: receipt.publicId,
      event: "delete_receipt",
    });
  }

  await db.delete(receipts).where(eq(receipts.id, id));

  ///
  await invalidateCache(undefined, "cedarrise:general:receipts:*");
  ///

  return {
    code: 200,
    message: "Receipts deleted successfully",
  };
};
export const exportReceiptsTableToCSV = async () => {
  const data = await db.select().from(receipts);
  return data;
};

const FOLDER_MAP = {
  ASH: "/Cedarrise Initiative/ASH",
  OUTREACHES: "/Cedarrise Initiative/OUTREACHES",
  CAPACITY_BUILDING: "/Cedarrise Initiative/CAPACITY BUILDING",
} as const;

// PHOTO UPLOADS
export const uploadPhotos = async (
  files: Express.Multer.File[],
  folder: keyof typeof FOLDER_MAP,
) => {
  // console.log(files);
  let i = 0;
  const uploadFolder = FOLDER_MAP[folder] ?? FOLDER_MAP.ASH;
  for (const file of files) {
    i++;
    await uploadToCloudinary(file, uploadFolder);
  }

  appEvents.emit(GENERAL_EVENTS.UPLOAD_PHOTO, { newPhotosCount: i });

  return {
    code: 201,
    message: "Photos uploaded successfully",
  };
};

// GOOGLE-FORM UPLOADS
export const uploadGoogleForm = async (
  url: string,
  title: string,
  deadline: Date,
  description?: string,
) => {
  const [googleFormDetails] = await db
    .insert(googleForms)
    .values({
      src: url,
      title,
      deadline: sql`TO_DATE(${deadline}, 'YYYY-MM-DD')`,
      description,
    })
    .returning();

  // cache delete
  await cacheDel("cedarrise:general:googleform");

  return {
    code: 201,
    message: "Form Link Uploaded successfully",
    data: googleFormDetails,
  };
};
export const getGoogleForm = async () => {
  /// cache
  const key = `cedarrise:general:googleform`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "Form Link Retrieved Successfully",
      data: cacheRes,
    };
  }
  ///

  const todaysDate = new Date(Date.now());
  const [googleFormDetails] = await db
    .select({
      src: googleForms.src,
      title: googleForms?.title,
    })
    .from(googleForms)
    .where(lt(sql`TO_DATE(${todaysDate}, 'YYYY-MM-DD')`, googleForms.deadline));

  if (!googleFormDetails) {
    return {
      code: 200,
      message: "Form Link Retrieved Successfully",
      data: {
        src: "",
        title: "Form",
      },
    };
  }

  // cache set
  await cacheSet(key, googleFormDetails, CACHE_TTL.GALLERY);

  return {
    code: 200,
    message: "Form Link Retrieved Successfully",
    data: googleFormDetails,
  };
};

// GENERAL UPLOADS METADATA
export const getMetadata = async () => {
  /// cache
  const key = `cedarrise:general:metadata`;
  const cacheRes = await cacheGet<any>(key);

  if (cacheRes) {
    return {
      code: 200,
      message: "General uploads' page metadata found successfully",
      data: cacheRes,
    };
  }
  ///

  const [[noOfPhotos], [activeProjects], [receiptsLogged], [systemUsers]] = await Promise.all([
    db.select().from(photoCount),
    db
      .select({ value: count(projects.id) })
      .from(projects)
      .where(eq(projects.status, "ongoing")),
    db.select({ value: count(receipts.id) }).from(receipts),
    db.select({ value: count(users.id) }).from(users),
  ]);

  ///
  await cacheSet(
    key,
    {
      photosUploaded: Number(noOfPhotos?.numberOfPhotos ?? 0),
      activeProjects: Number(activeProjects?.value ?? 0),
      receiptsLogged: Number(receiptsLogged?.value ?? 0),
      systemUsers: Number(systemUsers?.value ?? 0),
    },
    CACHE_TTL.GALLERY,
  );
  ///

  return {
    code: 200,
    message: "General uploads' page metadata found successfully",
    data: {
      photosUploaded: Number(noOfPhotos?.numberOfPhotos ?? 0),
      activeProjects: Number(activeProjects?.value ?? 0),
      receiptsLogged: Number(receiptsLogged?.value ?? 0),
      systemUsers: Number(systemUsers?.value ?? 0),
    },
  };
};

export const feature = async (req: Request, options: any) => {};
