import { photoCount } from "../db/models/general.js";
import { appEvents } from "../lib/events.js";
import { sql } from "drizzle-orm";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
// import ejs from "ejs";
// import { sendEmail } from "../utils/sendEmail.util.js";

export const GENERAL_EVENTS = {
  UPLOAD_PHOTO: "upload:photo",
} as const;

appEvents.on(GENERAL_EVENTS.UPLOAD_PHOTO, async (data) => {
  try {
    await db
      .update(photoCount)
      .set({ numberOfPhotos: sql`${photoCount.numberOfPhotos} + ${data.newPhotosCount}` });

    logger.info(`success! updated photo's count with ${data.newPhotosCount} new photos`);
  } catch (err) {
    logger.error(
      `failure :( could not update photo count to include ${data.newPhotosCount} new photos`,
    );
  }
});

// SEND EMAIL
// appEvents.on(FEATURE_EVENTS.FEATURE_ACTION, async (data) => {
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
