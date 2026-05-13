import * as p from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";

// DONORS 
export const donors = p.pgTable(
  "donors",
  {
    id: p.uuid().primaryKey().notNull(),
    amount: p.numeric("amount_donated", { mode: "number" }).notNull(),
    name: p.text().notNull(),
    email: p.text().notNull(),
    comment: p.text(),
    date: p.timestamp().defaultNow().notNull(),
  }, 
  (table) => [index("donor_idx").on(table.date)],
);
