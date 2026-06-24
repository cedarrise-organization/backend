import { invalidateCache } from "../utils/cache.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";
import logger from "../configs/logger.config.js";
import ejs from "ejs";

export const VOLUNTEER_EVENTS = {
  VOLUNTEER_ACCEPTED: "volunteer:accepted",
  VOLUNTEER_REJECTED: "volunteer:rejected",
  DELETE_CACHE: "volunteer:delete:cache",
} as const;

// INFORM STUDENT VIA EMAIL ON ACCEPTANCE
appEvents.on(VOLUNTEER_EVENTS.VOLUNTEER_ACCEPTED, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/welcomevolunteer.ejs",
      { name: data.name, volunteerAreas: data.volunteerAreas },
      { async: true },
    );

    const info = await sendEmail(data.email, "Volunteer Application Accepted", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Volunteer welcome email sent successully", {
      message: "new volunteer accepted",
      // info: info.accepted,
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send volunteer welcome email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// INFORM STUDENT VIA EMAIL ON REJECTION
appEvents.on(VOLUNTEER_EVENTS.VOLUNTEER_REJECTED, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/volunteerapplicationrejection.ejs",
      { name: data.name },
      { async: true },
    );

    const info = await sendEmail(data.email, "Volunteer Application Update", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Volunteer Application Update email sent successully", {
      message: "volunteer applicant rejected",
      // info: info.accepted,
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send volunteer application update email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// DELETE CACHE ON UPDATE OR DELETE
appEvents.on(VOLUNTEER_EVENTS.DELETE_CACHE, async (data) => {
  try {
    await invalidateCache(data.singleKey, data.patternKey);
    logger.info("cache removed", {
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      affectedService: data.affectedService,
      // correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Could not remove cache", {
      message: error.message,
      affectedService: data.affectedService,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId
    });
  }
});

// appEvents.on(VOLUNTEER_EVENTS.FEATURE_ACTION, async (data) => {
//   try {
//     logger.info("success", { data });
//   } catch (err) {
//     logger.error("failure", { data });
//   }
// });

// /* SEND EMAIL */
// appEvents.on(VOLUNTEER_EVENTS.FEATURE_ACTION, async (data) => {
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
