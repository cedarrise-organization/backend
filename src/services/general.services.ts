import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from "../lib/cache.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/storage.util.js";
import { projects } from "../db/models/admin.js";
import { UploadApiResponse } from "cloudinary";
import { Request } from "express";
import { sql, eq, desc, asc } from "drizzle-orm";
import db from "../db/db.js";
import { cache } from "ejs";
import logger from "../configs/logger.config.js";

export const getProjects = async () => {
  ///
  const key = `cedarrise:dashboard:projects`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Found all projects successfully",
      data: cacheRes,
    };
  }
  ///

  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

  ///
  await cacheSet("cedarrise:dashboard:projects", allProjects, CACHE_TTL.DASHBOARD_CARDS);
  ///

  return {
    code: 200,
    message: "Found all projects successfully",
    data: allProjects,
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
  if ((req as any).file) {
    const [project] = await db
      .select({ publicId: projects.imagePublicId })
      .from(projects)
      .where(eq(projects.id, id));

    if (!project?.publicId) {
      throw new Error("project not found");
    }

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
    message: "Project status deleted successfully",
  };
};

export const feature = async (req: Request, options: any) => {};
