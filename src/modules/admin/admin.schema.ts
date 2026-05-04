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

// create custom types for request bodies with enums
