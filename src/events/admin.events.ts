import logger from "../configs/logger.config.js";
import db from "../db/db.js";
import ejs from "ejs";
import { sendEmail } from "../utils/sendEmail.util.js";
import { appEvents } from "../lib/events.js";
import { users } from "../db/models/auth.js";
import { cacheDel } from "../lib/cache.js";
import { eq } from "drizzle-orm";
import { invalidateCache } from "../utils/cache.util.js";

export const ADMIN_EVENTS = {
  ASSIGN_ROLE: "admin:role-assigned",
  REVOKE_ROLE: "admin:role-revoked",
  CREATE_USER: "admin:create-user",
  DELETE_USER: "admin:delete-user",
  DELETE_CACHE: "admin:delete:cache",
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
  } catch (error: any) {
    logger.error("Could not remove permissions cache", {
      // error,
      user: data.userId,
      message: error.message,
      // correlationId: data.correlationId
    });
  }
});

// INFORM USER OF NEW ROLE ASSIGNED VIA EMAIL
appEvents.on(ADMIN_EVENTS.ASSIGN_ROLE, async (data) => {
  try {
    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, data.userId));

    if (!user) {
      throw new Error();
    }

    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/rolechange.ejs",
      { name: user.name, role: data.role, email: user.email },
      { async: true },
    );

    const info = await sendEmail(user.email, "You've been assigned a new Role!", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Role assignment email sent successully", {
      // info: info.accepted,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send Role assignment email", {
      email: data.email,
      message: error.message,
      // correlationId
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
  } catch (error: any) {
    logger.error("Could not remove permissions cache", {
      message: error.message,
      user: data.userId,
      // correlationId: data.correlationId
    });
  }
});

// INFORM USER OF ROLE REVOKED  VIA EMAIL
appEvents.on(ADMIN_EVENTS.REVOKE_ROLE, async (data) => {
  try {
    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, data.userId));

    if (!user) {
      throw new Error();
    }

    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/rolerevoked.ejs",
      { name: user.name, role: data.role, email: user.email },
      { async: true },
    );

    const info = await sendEmail(user.email, "Role revocation", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Role revocation email sent successully", {
      // info: info.accepted,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send Role revocation email", {
      email: data.email,
      message: error.message,
      // correlationId
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

// DELETE USER LOOKUP AND USER PAGE CACHE
appEvents.on(ADMIN_EVENTS.CREATE_USER, async (data) => {
  const key = `cedarrise:lookup:*`;
  try {
    await invalidateCache(undefined, key);
    logger.info("User Lookup and User Page cache removed", {
      user: data.userId,
      // correlationId: data.correlationId
    });
  } catch (error: any) {
    logger.error("Could not remove user lookup and user page cache", {
      message: error.message,
      user: data.userId,
      // correlationId: data.correlationId
    });
  }
});

// SEND CREDENTIALS TO NEW USER VIA EMAIL
appEvents.on(ADMIN_EVENTS.CREATE_USER, async (data) => {
  try {
    let content = await ejs.renderFile(
      process.cwd() + "/src/views/emails/welcome.ejs",
      {
        name: data.name,
        role: data.role,
        email: data.email,
        password: data.password,
        department: data.department,
      },
      { async: true },
    );

    const info = await sendEmail(data.email, "Welcome to the Cedarrise Team", content);

    if (!info) {
      throw new Error();
    }

    logger.info("Welcome email sent successully", {
      // info: info.accepted,
      // correlationId
    });
  } catch (error: any) {
    logger.info("Failed to send welcome email", {
      email: data.email,
      message: error.message,
      // correlationId
    });
  }
});

// LOG DELETED USER
appEvents.on(ADMIN_EVENTS.DELETE_USER, async (data) => {
  logger.info(`user deleted`, {
    deletedUser: data.name,
    // originator: data.id
    // correlationId: data.correlationId
  });
});

// DELETE CACHE ON UPDATE OR DELETE
appEvents.on(ADMIN_EVENTS.DELETE_CACHE, async (data) => {
  try {
    await invalidateCache(data.singleKey, data.patternKey);
    logger.info("cache **if any** removed", {
      event: data.event,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId,
    });
  } catch (error: any) {
    logger.error("Could not remove cache **if any**", {
      message: error.message,
      event: data.event,
      singleKey: data.singleKey,
      patternKey: data.patternKey,
      // correlationId: data.correlationId
    });
  }
});
