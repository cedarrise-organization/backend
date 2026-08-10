//MODELS
import * as z from "zod";
import { baseQueryBody } from "../../../db/globalschema/global.schema.js";

export const donateSchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(100, "Donation must be more than N100")
      .transform((v) => v * 100),
    email: z.email("Invalid email"),
    name: z.string().min(3, "Name must have up to 3 characters"),
    comment: z.string().optional(),
    supportAreas: z.preprocess(
      (v) => {
        if (v === "" || v == null) return undefined;
        if (Array.isArray(v)) return v;
        if (typeof v === "string") return [v];
        return v;
      },
      z
        .array(
          z.enum([
            "SPONSOR_ASH_BENEFICIARY",
            "SPONSOR_TACOTS_BENEFICIARY",
            "FUND_BOOTCAMP",
            "FUND_TEACHER_REFRESHER_COURSE",
            "FUND_YOUTH_INITIATIVE",
            "DONATE_OUTREACH_EVENTS_AND_MATERIALS",
            "OTHER",
          ]),
        )
        .optional(),
    ),
  }),
});

export const verifySchema = z.object({
  query: z.object({
    reference: z.string(),
  }),
});

export const donateQuerySchema = z.object({
  query: z.object({
    ...baseQueryBody,
    sortBy: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(["name", "amount", "email", "createdAt"]).default("createdAt"),
    ),
  }),
});

export const donateParamsSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  })
})

// create custom types for request bodies with enums
