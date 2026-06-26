import db from "../../db/db.js";
import logger from "../../configs/logger.config.js";
import { CACHE_TTL, cacheDel, cacheGet, cacheSet } from "../../lib/cache.js";
import { blogs } from "../../db/models/blogs.js";
import { UploadApiResponse } from "cloudinary";
import { count, desc, eq, sql } from "drizzle-orm";
import { Request } from "express";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/storage.util.js";
import { invalidateCache } from "../../utils/cache.util.js";

export const listBlogs = async (page: number, limit: number, search: string) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${blogs.title}), 'A') ||
      setweight(to_tsvector('english', ${blogs.description}), 'A') 
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [allBlogs, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(blogs)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ value: count(blogs.id) })
        .from(blogs)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "Blogs found successfully",
      data: allBlogs,
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
  const key = `cedarrise:blogs:list:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "Blogs found successfully",
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

  const [allBlogs, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(blogs)
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(desc(blogs.date)),
    db.select({ value: count(blogs.id) }).from(blogs),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: allBlogs, totalPages }, CACHE_TTL.BLOGS);
  ///

  return {
    code: 200,
    message: "Blogs found successfully",
    data: allBlogs,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
    },
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
  const response: UploadApiResponse | undefined = await uploadToCloudinary(
    (req as any).file,
    "/Cedarrise Initiative/BLOG",
  );

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

  await invalidateCache(undefined, `cedarrise:blogs:*`);

  return {
    code: 201,
    message: "Blog created successfully",
    data: newBlog,
  };
};

export const deleteBlog = async (id: string) => {
  const [blog] = await db
    .delete(blogs)
    .where(eq(blogs.id, id))
    .returning({ id: blogs.id, publicId: blogs.publicId });

  if (blog?.publicId) {
    const deleteResponse = await deleteFromCloudinary(blog.publicId, "image");

    if (deleteResponse.result !== "ok") {
      logger.error("Blog pdf was not deleted from s3", {
        publicId: blogs.publicId,
        event: "delete_blog",
      });
    }
  }

  await invalidateCache(undefined, `cedarrise:blogs:*`);

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

  await invalidateCache(undefined, `cedarrise:blogs:*`);

  return {
    code: 200,
    message: "Blog post updated successfully",
  };
};
