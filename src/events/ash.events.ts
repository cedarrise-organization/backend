import { invalidateCache } from "../utils/cache.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";
import logger from "../configs/logger.config.js";
import ejs from "ejs";


export const ASH_EVENTS = {
  STUDENT_ACCEPTED: "ash:student:accepted",
  STUDENT_REJECTED: "ash:student:rejected",
  DELETE_CACHE: "ash:delete:cache",
} as const;

// INFORM STUDENT VIA EMAIL ON ACCEPTANCE
appEvents.on(ASH_EVENTS.STUDENT_ACCEPTED, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/welcometoash.ejs",
      { studentName: data.name },
      { async: true },
    );

    const info = await sendEmail(data.email, "Welcome to ASH", content);

    if (!info) {
      throw new Error();
    }

    logger.info("ASH welcome email sent successully", {
      message: "new student accepted into ASH",
      // info: info.accepted,
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send ash welcome email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// INFORM STUDENT VIA EMAIL ON REJECTED
appEvents.on(ASH_EVENTS.STUDENT_REJECTED, async (data) => {
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

    logger.info("ASH rejection email sent successully", {
      message: "new student rejected from ASH",
      // info: info.accepted,
      studentId: data.userId,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send ash rejection email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// DELETE CACHE ON UPDATE OR DELETE
appEvents.on(ASH_EVENTS.DELETE_CACHE, async (data) => {
  try {
    await invalidateCache(data.singleKey, data.patternKey);
    logger.info("cache **if any** removed", {
      event: data.affectedService,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId,
    });
  } catch (error: any) {
    logger.error("Could not remove cache **if any**", {
      message: error.message,
      event: data.affectedService,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId
    });
  }
});

// appEvents.on(ASH_EVENTS.FEATURE_ACTION, async (data) => {
//   try {
//     logger.info("success", { data });
//   } catch (err) {
//     logger.error("failure", { data });
//   }
// });

// /* SEND EMAIL */
// appEvents.on(ASH_EVENTS.FEATURE_ACTION, async (data) => {
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
