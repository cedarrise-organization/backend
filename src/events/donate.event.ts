import { sendEmail } from "../utils/sendEmail.util.js";
import { donors } from "../db/models/donors.js";
import { appEvents } from "../lib/events.js";
import { sql } from "drizzle-orm";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
import ejs from "ejs";


// DEFINE EVENT NAMES AS CONSTANTS
export const DONATE_EVENTS = {
  DONATION_MADE: "donation:success",
  DONATION_FAILED: "donation:failed",
} as const;

// CREATE NEW DONOR
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
  } catch (err) {
    logger.info("Failed to create Donation record", {
      email: data.email,
      // correlationId
    });
  }
});

// SEND THANK YOU EMAIL TO DONOR
appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  let content = await ejs.renderFile(
    process.cwd() + "/src/views/emails/donation.ejs",
    { donorName: data.name },
    { async: true },
  );
  try {
    const info = await sendEmail(data.email, "Thank You For Your Donation", content);

    if (!info) {
      throw new Error
    }

    logger.info("Thank you email sent successully", {
      info: info.accepted,
      // correlationId
    });
  } catch (error) {
    logger.info("Failed to send Donation email", {
      email: data.email,
      // correlationId
    });
  }
});
