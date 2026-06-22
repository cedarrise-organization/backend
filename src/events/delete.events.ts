import logger from "../configs/logger.config.js";
import ejs from "ejs";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";

// DEFINE EVENT NAMES AS CONSTANTS
export const DELETE_EVENTS = {
  DELETE_CACHE: "delete:cache",
  /**
   * ..other event names
   */
} as const;

appEvents.on(DELETE_EVENTS.DELETE_CACHE, async (data) => {
  try {
    logger.info("success", { data });
  } catch (err) {
    logger.error("failure", { data });
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
