//MODELS
import * as z from "zod";

export const donateSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(100, "Donation must be more than N100")
      .transform((v) => v * 100),
    email: z.email("Invalid email"),
    name: z.string().min(3, "Name must have up to 3 characters"),
    comment: z.string().optional(),
  }),
});

export const verifySchema = z.object({
  query: z.object({
    reference: z.string()
  }),
});

// create custom types for request bodies with enums