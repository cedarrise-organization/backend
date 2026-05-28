import * as z from "zod"

export const carouselSchema = z.object({
    query: z.object({
        limit: z.coerce.number().int().min(18).max(99).default(36)
    })
})