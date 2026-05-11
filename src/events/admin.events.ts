import logger from "../configs/logger.config.js";
import { appEvents } from "../lib/events.js";
import { cacheDel } from "../lib/cache.js";

export const ADMIN_EVENTS = {
  ASSIGN_ROLE: "admin:role-assigned",
  REVOKE_ROLE: "admin:role-revoked",
  CREATE_USER: "admin:create-user",
} as const;

// LOG ASSIGNED ROLE
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

// LOG REVOKED ROLE
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

// LOG NEW USER
appEvents.on(ADMIN_EVENTS.CREATE_USER, async (data) => {
  logger.info(`New user created`, {
    name: data.name,
    userId: data.userId,
    // correlationId: data.correlationId
  });
});