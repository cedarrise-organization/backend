import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";
import { cacheDel } from "../lib/cache.js";

export const ADMIN_EVENTS = {
  ASSIGN_ROLE: "admin:role-assigned",
  REVOKE_ROLE: "admin:role-revoked",
} as const;

// LOG
appEvents.on(ADMIN_EVENTS.ASSIGN_ROLE, async (data) => {
  logger.info(`Role assigned to user`, {
    role: data.role,
    user: data.userId,
    // correlationId: data.correlationId
  });
});

// DELETE CACHE ON ROLE ASSIGNED
appEvents.on(ADMIN_EVENTS.ASSIGN_ROLE, async (data) => {
  const key = `cedarrise:permissions:${data.userId}`;
  try {
    await cacheDel(key);
    logger.info("Permissions cache removed", {
      user: data.userId,
      // correlationId: data.correlationId
    });
  } catch (err) {
    logger.error("Could not remove permissions cache", {
      err,
      user: data.userId,
      // correlationId: data.correlationId
    });
  }
});

// LOG
appEvents.on(ADMIN_EVENTS.REVOKE_ROLE, async (data) => {
  logger.info(`Role revoked from user`, {
    role: data.role,
    user: data.userId,
    // correlationId: data.correlationId
  });
});

// DELETE CACHE ON ROLE REVOKED
appEvents.on(ADMIN_EVENTS.REVOKE_ROLE, async (data) => {
  const key = `cedarrise:permissions:${data.userId}`;
  try {
    await cacheDel(key);
    logger.info("Permissions cache removed", {
      user: data.userId,
      // correlationId: data.correlationId
    });
  } catch (err) {
    logger.error("Could not remove permissions cache", {
      err,
      user: data.userId,
      // correlationId: data.correlationId
    });
  }
});
