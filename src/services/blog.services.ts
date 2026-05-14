import db from "../db/db.js";
import cloudinary from "../configs/cloudinary.config.js";
import { sql } from "drizzle-orm";
import { Request } from "express";
import { blog } from "../db/models/blog.js";
import { UploadApiResponse } from "cloudinary";

export const listBlog = async () => {};

export const getSingleBlog = async () => {};

export const createBlog = async (req: Request, title: string, description: string) => {
  const response = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "/Cedarrise Initiative/BLOG",
          resource_type: "auto",
        },
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }
          return resolve(uploadResult);
        },
      )
      .end(req.file?.buffer);
  });

  if (!response) {
    return {
      code: 500,
      message: "could not upload pdf",
    };
  }

  const [newBlog] = await db
    .insert(blog)
    .values({
      id: sql`uuid_generate_v4()`,
      title,
      description,
      documentUrl: response.secure_url,
    })
    .returning();

  return {
    code: 201,
    message: "Blog created successfully",
    data: newBlog,
  };
};

export const deleteBlog = async () => {};

export const updateBlog = async () => {};
