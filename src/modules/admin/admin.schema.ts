//MODELS
import * as z from "zod";

export const userIdSchema = z.object({
  params: z.object({
    userId: z.uuid("Invalid ID"),
  }),
});

export const roleActionSchema = z.object({
  params: z.object({
    userId: z.uuid("Invalid ID"),
  }),
  query: z.object({
    action: z.enum(["assign", "revoke"]),
    rolename: z.enum(["admin", "superadmin"]),
  }),
});

export const newUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "name must have at least 3 characters")
      .transform((v) => v.toLowerCase()),
    email: z.email().transform((v) => v.toLowerCase().trim()),
    password: z.string().min(8),
    department: z.enum(["TACOTS", "ASH", "CAPACITY BUILDING", "CEDAR OUTREACHES", "ADMINISTRATIVE SUPPORT"]),
  }),
});
// create custom types for request bodies with enums
