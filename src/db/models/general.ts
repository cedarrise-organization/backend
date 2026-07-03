import * as p from "drizzle-orm/pg-core";
import { index, primaryKey, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  updatedAt: p.timestamp("updated_at"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  deletedAt: p.timestamp("deleted_at"),
};

export const receipts = p.pgTable(
  "receipts",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    name: p.text().notNull(),
    amount: p.numeric({ mode: "number" }).notNull(),
    description: p.text(),
    uploadedBy: p.text("uploaded_by").notNull(),
    imageUrl: p.text("image_url").notNull(),
    imagePublicId: p.text("image_public_id").notNull(),
    ...timestamps,
  },
  (table) => [
    index("receipts_name_idx").on(table.name),
    index("receipts_amount_idx").on(table.amount),
    index("receipts_description_idx").on(table.description),
    index("receipts_uploadedBy_idx").on(table.uploadedBy),
    index("receipts_createdAt_idx").on(table.createdAt),
    index("receipts_search_index").using(
      "gin",
      sql`(
        setweight(to_tsvector('english', ${table.name}), 'A') ||
        setweight(to_tsvector('english', ${table.uploadedBy}), 'A') ||
        setweight(to_tsvector('english', coalesce(${table.amount}::text, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${table.description}, '')), 'C') 
      )`,
    ),
  ],
);

export const googleForms = p.pgTable("google_forms", {
  id: p
    .uuid()
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  title: p.text().notNull(),
  src: p.text().notNull(),
  description: p.text(),
  deadline: p.timestamp(),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
});

export const photoCount = p.pgTable(
  "photo_count",
  {
    numberOfPhotos: p.integer("numberOfPhotos").default(252).notNull().unique(),
  },
  (table) => [index("photo_count_index").on(table.numberOfPhotos)],
);
