//MODELS
import * as z from "zod";

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

export const generalParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});