import { invalidateCache } from "../utils/cache.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";
import logger from "../configs/logger.config.js";
import ejs from "ejs";

// DEFINE EVENT NAMES AS CONSTANTS
export const TACOTS_EVENTS = {
  APPLICANT_ACCEPTED: "tacots:applicant:accepted",
  APPLICANT_REJECTED: "tacots:applicant:rejected",
  DELETE_CACHE: "tacots:delete:cache",
} as const;

// INFORM APPLICANT VIA EMAIL ON ACCEPTANCE
appEvents.on(TACOTS_EVENTS.APPLICANT_ACCEPTED, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/welcometotacots.ejs",
      { studentName: data.name },
      { async: true },
    );

    const info = await sendEmail(data.email, "Welcome to TACOTS", content);

    if (!info) {
      throw new Error();
    }

    logger.info("TACOTS welcome email sent successully", {
      // info: info.accepted,
      message: "new student accepted into TACOTS",
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send TACOTS welcome email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// INFORM APPLICANT VIA EMAIL ON REJECTED
appEvents.on(TACOTS_EVENTS.APPLICANT_REJECTED, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/----.ejs",
      { studentName: data.name },
      { async: true },
    );

    const info = await sendEmail(data.email, "We are sorry to inform you", content);

    if (!info) {
      throw new Error();
    }

    logger.info("TACOTS rejection email sent successully", {
      // info: info.accepted,
      message: "student rejected from TACOTS",
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send TACOTS rejection email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// DELETE CACHE ON UPDATE OR DELETE
appEvents.on(TACOTS_EVENTS.DELETE_CACHE, async (data) => {
  try {
    await invalidateCache(data.singleKey, data.patternKey);
    logger.info("cache **if any** removed", {
      event: data.event,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Could not remove cache **if any**", {
      message: error.message,
      event: data.event,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId
    });
  }
});

// appEvents.on(TACOTS_EVENTS.FEATURE_ACTION, async (data) => {
//   try {
//     logger.info("success", { data });
//   } catch (err) {
//     logger.error("failure", { data });
//   }
// });

// /* SEND EMAIL */
// appEvents.on(TACOTS_EVENTS.FEATURE_ACTION, async (data) => {
//   try {
//     let content = await ejs.renderFile(
//       process.cwd() + "/src/views/emails/----.ejs",
//       {},
//       { async: true },
//     );

//     const info = await sendEmail(data.email, "", content);

//     if (!info) {
//       throw new Error();
//     }

//     logger.info("email sent successully", {
//       info: info.accepted,
//       // correlationId
//     });
//   } catch (error: any) {
//     logger.info("Failed to send email", {
//       email: data.email,
//       message: error.message
//       // correlationId
//     });
//   }
// });
