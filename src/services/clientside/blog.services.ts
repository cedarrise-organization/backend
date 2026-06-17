import db from "../../db/db.js";
import logger from "../../configs/logger.config.js";
import cloudinary from "../../configs/cloudinary.config.js";
import { CACHE_TTL, cacheDel, cacheGet, cacheSet } from "../../lib/cache.js";
import { blogs } from "../../db/models/blogs.js";
import { UploadApiResponse } from "cloudinary";
import { asc, desc, eq, sql } from "drizzle-orm";
import { Request } from "express";
import {
  uploadToCloudinary,
  searchCloudinary,
  deleteFromCloudinary,
} from "../../utils/storage.util.js";

export const listBlogs = async (page: number, limit: number) => {
  /// cache
  const key = `cedarrise:blogs:list:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Blogs found successfully",
      data: cacheRes,
    };
  }
  ///

  const allBlogs = await db
    .select()
    .from(blogs)
    .offset((page - 1) * limit)
    .limit(limit)
    .orderBy(desc(blogs.date));

  /// cache set
  await cacheSet(key, allBlogs, CACHE_TTL.BLOGS);
  ///

  return {
    code: 200,
    message: "Blogs found successfully",
    data: allBlogs,
  };
};

export const getSingleBlog = async (id: string) => {
  /// cache
  const key = `cedarrise:blogs:single:${id}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Blog found successfully",
      data: cacheRes,
    };
  }
  ///

  const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));

  /// cache set
  await cacheSet(key, blog, CACHE_TTL.BLOGS);
  ///

  return {
    code: 200,
    message: "Blog found successfully",
    data: blog,
  };
};

export const createBlog = async (req: Request, title: string, description: string) => {
  const response = await uploadToCloudinary((req as any).file, "/Cedarrise Initiative/BLOG");

  if (!response) {
    throw new Error("Could not upload pdf");
  }

  const [newBlog] = await db
    .insert(blogs)
    .values({
      title,
      description,
      documentUrl: response.secure_url,
      publicId: response.public_id,
    })
    .returning();

  /// cache set
  await cacheSet(`cedarrise:blogs:single:${newBlog?.id}`, newBlog, CACHE_TTL.BLOGS);
  ///

  return {
    code: 201,
    message: "Blog created successfully",
    data: newBlog,
  };
};

export const deleteBlog = async (id: string) => {
  const [blog] = await db
    .select({ id: blogs.id, publicId: blogs.publicId })
    .from(blogs)
    .where(eq(blogs.id, id));

  if (!blog) {
    throw new Error("Blog not found");
  }

  const deleteResponse = await deleteFromCloudinary(blog.publicId, "image");

  if (deleteResponse.result !== "ok") {
    logger.error("Blog pdf was not deleted from s3", {
      publicId: blogs.publicId,
      event: "delete_blog",
    });
  }

  await db.delete(blogs).where(eq(blogs.id, id));

  /// cache Del
  await cacheDel(`cedarrise:blogs:single:${blog?.id}`);
  ///

  return {
    code: 200,
    message: "Blog deleted successfully",
  };
};

export const updateBlog = async (
  id: string,
  req?: Request,
  title?: string,
  description?: string,
) => {
  const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));

  if (req?.file) {
    if (!blog) {
      throw new Error("Blog not found");
    }

    const deleteResponse = await deleteFromCloudinary(blog.publicId, "image");

    if (deleteResponse.result !== "ok") {
      logger.error("Blog pdf was not deleted from s3", {
        publicId: blogs.publicId,
        event: "update_blog",
      });
    }

    const uploadResponse = await uploadToCloudinary(req.file, "/Cedarrise Initiative/BLOG");

    if (!uploadResponse) {
      throw new Error("Could not upload pdf");
    }

    await db
      .update(blogs)
      .set({ publicId: uploadResponse.public_id })
      .where(eq(blogs.id, id))
      .returning();
  }

  if (title === undefined && description === undefined) {
    return {
      code: 200,
      message: "Update submission should include at least one field",
    };
  }

  // values of undefined are ignored. To set null, pass null
  // however both cannot be undefined
  await db.update(blogs).set({ title, description }).where(eq(blogs.id, id)).returning();

  /// cache Del
  await cacheDel(`cedarrise:blogs:single:${blog?.id}`);
  ///

  return {
    code: 200,
    message: "Blog post updated successfully",
  };
};
