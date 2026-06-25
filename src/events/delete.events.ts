import { invalidateCache } from "../utils/cache.util.js";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";
import logger from "../configs/logger.config.js";
import ejs from "ejs";

// DEFINE EVENT NAMES AS CONSTANTS
export const DELETE_EVENTS = {
  DELETE_CACHE: "delete:cache",
  /**
   * ..other event names
   */
} as const;

// DELETE CACHE ON TRIGGER
appEvents.on(DELETE_EVENTS.DELETE_CACHE, async (data) => {
  try {
    await invalidateCache(data.singleKey, data.patternKey);
    logger.info("success. cache **if any** removed", {
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      affectedService: data.affectedService,
      // correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("failure. cache **if any** was not removed", {
      message: error.message,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      affectedService: data.affectedService,
      // correlationId: data.correlationId
    });
  }
});

// // SEND EMAIL
// appEvents.on(DELETE_EVENTS.DELETE_CACHE, async (data) => {
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
