//MODELS
import * as z from "zod";

export const blogBodySchema = z.object({
  body: z.object({
    title: z.string("title is required").min(3, "title should be at least 3 characters"),
    description: z.string().optional(),
  }),
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.enum(
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      "Uploaded file should be a pdf, doc, xls or image",
    ),
    size: z.number().max(20 * 1024 * 1024, "file must not be more than 20mb"), // 20MB,
    buffer: z.instanceof(Buffer),
  }),
});

export const blogQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const blogParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

// create custom types for request bodies with enums
