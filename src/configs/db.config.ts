import { drizzle } from "drizzle-orm/node-postgres";

const dburl = process.env.PG_DATABASE_DEV_URL;

const db = drizzle({
  connection: {
    connectionString: "postgresql://postgres:1234@localhost:5432/cedar",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
});

export default db;
