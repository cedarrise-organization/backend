//MODELS
import * as z from "zod";

export const homeFeedbackSchema = z.object({
  body: z.object({
    email: z.email("Invalid email"),
    feedback: z.string().min(10, "Feedback must have more then 10 characters").max(500),
  }),
});

export type Homefeedback = z.infer<typeof homeFeedbackSchema>; 
