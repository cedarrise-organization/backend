import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";
import { donors } from "../db/models/donors.js";
import db from "../db/db.js";
import { sql } from "drizzle-orm";

// DEFINE EVENT NAMES AS CONSTANTS
export const DONATE_EVENTS = {
  DONATION_MADE: "donation:success",
  DONATION_FAILED: "donation:failed",
} as const;

appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  try {
    await db.insert(donors).values({
      id: sql`uuid_generate_v4()`,
      amount: data.amount,
      name: data.name,
      email: data.email,
      comment: data.comment,
    });

    logger.info("Donotion record created!", {
      email: data.email,
      // correlationId
    });

    //could send email thanking them for their donation
  } catch (err) {
    logger.info("Failed to create Donation record", {
      email: data.email,
      // correlationId
    });
  }
});
