import * as z from "zod";

// CONSTS
const optionalQueryNumber = (defaultValue: number) =>
  z.preprocess((v) => {
    if (v === "" || v === undefined || Number.isNaN(Number(v))) {
      return undefined;
    }

    return v;
  }, z.coerce.number().int().min(1).max(100).default(defaultValue));

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    orderBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["asc", "desc"]).default("desc"),
    ),
    search: z.string().trim().optional(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

export const baseQueryBody = {
  page: optionalQueryNumber(1),
  limit: optionalQueryNumber(25),
  orderBy: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["asc", "desc"]).default("desc")),
  search: z.string().trim().optional(),
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const uploadedFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "file must not be more than 20mb"),
  buffer: z.instanceof(Buffer),
});

export const uploadedFileObjectSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "file must not be more than 20mb"),
  buffer: z.instanceof(Buffer),
});

export const imageFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      "Uploaded file should be jpeg, jpg, png, or webp",
    ),
  }),
);

export const documentFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      "Uploaded file should be a pdf, doc, or docx",
    ),
  }),
);

export const resultFileSchema = z.array(
  uploadedFileObjectSchema.extend({
    mimetype: z.enum(
      ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
      "Uploaded file should be an image or pdf",
    ),
  }),
);

export const singleResultFileSchema = uploadedFileObjectSchema.extend({
  mimetype: z.enum(
    ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
    "Uploaded file should be an image or pdf",
  ),
});

export const textSchema = z.string().transform((v) => v.toLowerCase().trim());
export const optionalTextSchema = z.preprocess(
  (v) => (v === "" ? undefined : v),
  textSchema.optional(),
);

export const emailSchema = z.email().transform((v) => v.toLowerCase().trim());

export const genderSchema = z.enum(["MALE", "FEMALE"]);

export const yesNoSchema = z.enum(["YES", "NO"]);

export const statusSchema = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.enum(["accepted", "rejected", "pending"]).default("pending"),
);

export const adminStatusSchema = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.enum(["NOT SELECTED", "KEEP IN VIEW", "SELECTED"]).default("KEEP IN VIEW"),
);

export const academicSessionSchema = z.enum([
  "2025/26",
  "2026/27",
  "2027/28",
  "2028/29",
  "2029/30",
]);

export const nigerianStateSchema = z.enum([
  "ABIA",
  "ADAMAWA",
  "AKWA IBOM",
  "ANAMBRA",
  "BAUCHI",
  "BAYELSA",
  "BENUE",
  "BORNO",
  "CROSS RIVER",
  "DELTA",
  "EBONYI",
  "EDO",
  "EKITI",
  "ENUGU",
  "GOMBE",
  "IMO",
  "JIGAWA",
  "KADUNA",
  "KANO",
  "KATSINA",
  "KEBBI",
  "KOGI",
  "KWARA",
  "LAGOS",
  "NASARAWA",
  "NIGER",
  "OGUN",
  "ONDO",
  "OSUN",
  "OYO",
  "PLATEAU",
  "RIVERS",
  "SOKOTO",
  "TARABA",
  "YOBE",
  "ZAMFARA",
  "FCT",
  "OTHER",
]);

export const classSchema = z.enum([
  "PRIMARY 1",
  "PRIMARY 2",
  "PRIMARY 3",
  "PRIMARY 4",
  "PRIMARY 5",
  "PRIMARY 6",
  "JSS1",
  "JSS2",
  "JSS3",
  "SS1",
  "SS2",
  "SS3",
]);

export const rating1To5Schema = z.coerce.number().int().min(1).max(5);

export const rating1To10Schema = z.coerce.number().int().min(1).max(10);

export const numericSchema = z.coerce.number();
