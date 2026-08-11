//MODELS
import * as z from "zod";

// export const exampleBody = z.object({
//   body: z.object({
//     exampleString: z.string().min(1, "--- is required").max(500),
//     exampleNumber: z.coerce.number().int().min(1).max(100).default(20),
//     exampleEnum: z.enum(["", "", ""]).optional(),
//   }),
// });

// export const exampleQuery = z.object({
//   query: z.object({
//     exampleString: z.string(),
//     exampleNumber: z.number(),
//     exampleEnum: z.enum(["", "", ""]),
//   }),
// });

export const studentProfileParam = z.object({
  params: z.object({
    id: z.uuid("Invalid ID"),
  }),
});

// export type Examplebodytype = z.infer<typeof exampleBody>;
// export type Examplequerytype = z.infer<typeof exampleQuery>;
// export type Exampleparamtype = z.infer<typeof exampleParam>;
// create custom types for request bodies with enums