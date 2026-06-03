import * as p from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"

export const blogs = p.pgTable("blogs", {
  id: p.uuid().primaryKey().default(sql`uuid_generate_v4()`).notNull(),
  title: p.text().notNull(),
  description: p.text(),
  documentUrl: p.text("document_url").notNull(),
  publicId: p.text("public_id").notNull(),
  date: p.timestamp().defaultNow().notNull(),
});