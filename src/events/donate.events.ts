import { sendEmail } from "../utils/sendEmail.util.js";
import { donors } from "../db/models/donors.js";
import { appEvents } from "../lib/events.js";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
import ejs from "ejs";
import { invalidateCache } from "../utils/cache.util.js";

// DEFINE EVENT NAMES AS CONSTANTS
export const DONATE_EVENTS = {
  DONATION_MADE: "donation:success",
  DONATION_FAILED: "donation:failed",
} as const;

// CREATE NEW DONOR
appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  try {
    await db.insert(donors).values({
      amount: data.amount,
      name: data.name,
      email: data.email,
      comment: data.comment,
      supportAreas: data.supportAreas,
      metaData: JSON.stringify(data.metaData),
    });

    logger.info("Donation record created!", {
      email: data.email,
      correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Failed to create Donation record", {
      email: data.email,
      message: error.message,
      correlationId: data.correlationId
    });
  }
});

// SEND THANK YOU EMAIL TO DONOR
appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/donation.ejs",
      { donorName: data.name },
      { async: true },
    );

    const info = await sendEmail(data.email, "Thank You For Your Donation", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Thank you email sent successully", {
      // info: info.accepted,
      correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Failed to send `Thank you For Your Donation` email", {
      email: data.email,
      message: error.message,
      correlationId: data.correlationId
    });
  }
});

// INFORM CEDAR OF A DONATION
appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/donation-received.ejs",
      {
        donorName: data.name,
        donorEmail: data.email,
        amount: data.amount,
        supportAreas: data.supportAreas,
        otherSupportAreaNote: data.comment,
      },
      { async: true },
    );

    const info = await sendEmail(process.env.CEDAR_EMAIL!.toString(), "New Donation Received", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Donation Record email sent successully", {
      correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Failed to send Donation Record email", {
      email: data.email,
      message: error.message,
      correlationId: data.correlationId
    });
  }
});

// INVALIDATE CACHE DATA ON DONATION MADE
appEvents.on(DONATE_EVENTS.DONATION_MADE, async (data) => {
  try {
    await invalidateCache("cedarrise:clientside:donations:*")
    logger.info("Donation cache invalidated", {
      correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Failed to invalidate cache data", {
      correlationId: data.correlationId,
      message: error.message,
    });
  }
})