import * as p from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// DONORS
export const donors = p.pgTable(
  "donors",
  {
    id: p
      .uuid()
      .primaryKey()
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    amount: p.numeric("amount_donated", { mode: "number" }).notNull(),
    name: p.text().notNull(),
    email: p.text().notNull(),
    supportAreas: p.text("support_areas").array(),
    comment: p.text(),
    metaData: p.text("meta_data"),
    date: p.timestamp().defaultNow().notNull(),
  },
  (table) => [index("donor_idx").on(table.date)],
);
