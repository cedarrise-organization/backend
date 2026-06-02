//MODELS
import * as z from "zod";

export const exampleQuery = z.object({
  query: z.object({
    exampleString: z.string(),
    exampleNumber: z.number(),
    exampleEnum: z.enum(["", "", ""]),
  }),
});

