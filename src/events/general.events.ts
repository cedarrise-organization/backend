import { miscellaneous } from "../db/models/general.js";
import { appEvents } from "../lib/events.js";
import { sql } from "drizzle-orm";
import logger from "../configs/logger.config.js";
import db from "../db/db.js";
// import ejs from "ejs";
// import { sendEmail } from "../utils/sendEmail.util.js";

export const GENERAL_EVENTS = {
  UPLOAD_PHOTO: "upload:photo",
  SEND_PARTNER_REQUEST_EMAIL: "send:partner:request:email",
} as const;

appEvents.on(GENERAL_EVENTS.UPLOAD_PHOTO, async (data) => {
  try {
    await db
      .update(miscellaneous)
      .set({ numberOfPhotos: sql`${miscellaneous.numberOfPhotos} + ${data.newPhotosCount}` });

    logger.info(`success! updated photo's count with ${data.newPhotosCount} new photos`, {
      correlationId: data.correlationId,
    });
  } catch (err) {
    logger.error(
      `failure :( could not update photo count to include ${data.newPhotosCount} new photos`,
      { correlationId: data.correlationId },
    );
  }
});

appEvents.on(GENERAL_EVENTS.SEND_PARTNER_REQUEST_EMAIL, async (data) => {
  try {
    await db
      .update(miscellaneous)
      .set({ numberOfPartners: sql`${miscellaneous.numberOfPartners} + ${data.newPartnersCount}` });

    logger.info(`success! updated partners's count with ${data.newPartnersCount} new partners`, {
      correlationId: data.correlationId,
    });
  } catch (err) {
    logger.error(
      `failure :( could not update partner count to include ${data.newPartnersCount} new partners`,
      { correlationId: data.correlationId },
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
//       correlationId: data.correlationId
//     });
//   } catch (error: any) {
//     logger.error("Failed to send email", {
//       email: data.email,
//       message: error.message,
//       correlationId: data.correlationId
//     });
//   }
// });
