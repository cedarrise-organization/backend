import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";

// DEFINE EVENT NAMES AS CONSTANTS
export const FEATURE_EVENTS = {
  FEATURE_ACTION: "feature:action",
  /**
   * ..other event names
  */
} as const;



appEvents.on(FEATURE_EVENTS.FEATURE_ACTION, async (data) => {
  try {
    logger.info("success", { data });
  } catch (err) {
    logger.error("failure", { data });
  }
});
