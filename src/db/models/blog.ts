import * as p from "drizzle-orm/pg-core";

export const blog = p.pgTable("blog", {
  id: p.uuid().primaryKey().notNull(),
  title: p.text().notNull(),
  description: p.text(),
  documentUrl: p.text("document_url").notNull(),
  date: p.timestamp().defaultNow().notNull(),
});
