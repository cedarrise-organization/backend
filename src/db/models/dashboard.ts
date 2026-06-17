import * as p from "drizzle-orm/pg-core";
import { index, primaryKey, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  updatedAt: p.timestamp("updated_at"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  deletedAt: p.timestamp("deleted_at"),
};

export const projects = p.pgTable("projects", {
  id: p
    .uuid()
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  title: p.text().notNull(),
  description: p.text(),
  imageUrl: p
    .text()
    .default(
      "https://res.cloudinary.com/dhdfwtjs5/image/upload/v1780649959/ongoing_project_result_raix7r.webp",
    ),
  imagePublicId: p.text().default("ongoing_project_result_raix7r"),
  status: p.text().default("ongoing"),
  ...timestamps,
});

export const notifications = p.pgTable(
  "notifications",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    type: p.text().notNull(),
    title: p.text().notNull(),
    message: p.text().notNull(),
    severity: p.text().notNull(),
    entityType: p.text("entity_type").notNull(),
    dedupeKey: p.text("dedupe_key").notNull().unique(),
    status: p.text().notNull().default("active"),
    metadata: p.text("metadata"),

    createdAt: p.timestamp("created_at").defaultNow().notNull(),
    updatedAt: p
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    dismissedAt: p.timestamp("dismissed_at"),
    resolvedAt: p.timestamp("resolved_at"),
    expiresAt: p.timestamp("expires_at"),
    deletedAt: p.timestamp("deleted_at"),
  },
  (table) => [
    index("notifications_status_idx").on(table.status),
    index("notifications_type_idx").on(table.type),
    index("notifications_entity_type_idx").on(table.entityType),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);
