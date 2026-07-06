//MODELS
import * as z from "zod";
import { baseQueryBody, imageFileSchema } from "../../db/globalschema/global.schema.js";

export const generalParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const projectsSchema = z.object({
  body: z.object({
    title: z.string().min(3, "title should be at least 3 characters").max(150),
    description: z.string().optional(),
  }),
  file: z
    .object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.enum(
        ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        "Uploaded file should be a jpg, jpeg, png or webp",
      ),
      size: z.number().max(20 * 1024 * 1024, "file must not be more than 20mb"), // 20MB,
      buffer: z.instanceof(Buffer),
    })
    .optional(),
});

export const projectStatusSchema = z.object({
  query: z.object({
    status: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["ongoing", "completed"])),
  }),
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const receiptsSchema = z.object({
  body: z.object({
    name: z.string().min(3, "title should be at least 3 characters").max(150),
    amount: z.coerce.number().int().min(1000),
    description: z.string().optional(),
  }),
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.enum(
      ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      "Uploaded file should be a jpg, jpeg, png or webp",
    ),
    size: z.number().max(20 * 1024 * 1024, "file must not be more than 20mb"), // 20MB,
    buffer: z.instanceof(Buffer),
  }),
});

export const receiptsQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["name", "amount", "description", "uploadedBy", "createdAt"]).default("createdAt"),
    ),
  }),
});

export const gallerySchema = z.object({
  query: z.object({
    folder: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["ASH", "OUTREACHES", "CAPACITY_BUILDING"]).default("ASH"),
    ),
  }),

  files: imageFileSchema
    .min(1, "At least one photo is required")
    .max(10, "Maximum of 10 photos allowed"),
});

export const googleSchema = z.object({
  body: z.object({
    title: z.string().min(3, "title should be at least 3 characters").max(100),
    src: z.string("please input a valid src"),
    description: z.string().optional(),
    deadline: z.coerce.date(),
  }),
});
