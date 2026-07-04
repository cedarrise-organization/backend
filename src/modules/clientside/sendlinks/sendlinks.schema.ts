//MODELS
import * as z from "zod";

export const sendLinkEmailSchema = z.object({
  body: z.object({
    email: z.email("Invalid email"),
    name: z.string().min(3, "Name must have up to 3 characters").max(256),
  }),
  query: z.object({
    program: z.enum(["ASH", "TACOTS", "VOLUNTEER"]),
    type: z.enum(["REGISTRATION", "FEEDBACK"]),
  }),
});

export const sendPWSEmailSchema = z.object({
  body: z.object({
    email: z.email("Invalid email"),
    name: z.string().min(3, "Name must have up to 3 characters").max(256),
    option: z.array(
      z.enum([
        "CO_HOST_PROGRAMS",
        "PROVIDE_RESOURCES",
        "SPONSOR_INITIATIVES",
        "OFFER_EXPERTISE",
        "OTHER",
      ]),
    ),
  }),
});

export type Sendlinkemailtype = z.infer<typeof sendLinkEmailSchema>;
export type Sendpwsemailtype = z.infer<typeof sendPWSEmailSchema>;
