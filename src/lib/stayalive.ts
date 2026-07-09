import ejs from "ejs";
import schedule from "node-schedule";
import logger from "../configs/logger.config.js";
import { cacheSet } from "./cache.js";
import { sendEmail } from "../utils/sendEmail.util.js";

// KEEP BREVO EMAIL API KEY FROM ROTATING
export async function keepEmailAlive() {
  schedule.scheduleJob("0 0 1 * *", async () => {
    logger.info("Running keepEmailAlive function...");
    try {
      let content = await ejs.renderFile(
        process.cwd() + "/src/views/emails/keepalive.ejs",
        {},
        { async: true },
      );

      const info = await sendEmail(process.env.DEV_EMAIL!.toString(), "KEEP ALIVE", content);

      if (!info) {
        throw new Error();
      }

      logger.info("[cron] KEEP ALIVE email sent successully");
    } catch (error: any) {
      logger.error("[cron] failed to send KEEP ALIVE email", {
        email: process.env.DEV_EMAIL!.toString(),
        message: error.message,
      });
    }
  });
}

// KEEP REDIS DB FROM DYING
export async function keepRedisAlive() {
  schedule.scheduleJob("0 0 14 * *", async () => {
    logger.info("Running keepRedisAlive function...");
    try {
      await cacheSet("foo", "bar", 60);
      logger.info("[cron] KEEP ALIVE redis key set successully");
    } catch (error: any) {
      logger.error("[cron] failed to set KEEP ALIVE redis key", {
        message: error.message,
      });
    }
  });
}
