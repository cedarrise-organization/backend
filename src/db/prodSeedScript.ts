import db from "./db.js";
import fs from "node:fs/promises";
import logger from "../configs/logger.config.js";
import { users, roles, permissions, rolepermissions, userroles } from "./models/auth.js";
import { projects, notifications } from "./models/dashboard.js";
import { receipts, miscellaneous, impactMetrics } from "./models/general.js";
import { refreshtoken } from "./models/auth.js";
import { donors } from "./models/donors.js";
import { blogs } from "./models/blogs.js";
import {
  ashStudent,
  ashOnlineRegistration,
  ashWeeklyAttendance,
  ashProgramFeedback,
  ashTermlyTracking,
  ashExit,
  capacityBuildingEvaluation,
  tacotsExit,
  tacotsOnboarding,
  tacotsRecommendation,
  tacotsTracking,
  tacotsFeedback,
  volunteerRegistration,
  volunteerFeedback,
  outreachTracker,
} from "./models/admin.js";
import { hashPassword } from "../utils/password.util.js";
import { eq, sql } from "drizzle-orm";

// CLEAR TABLES
const clearTables = async () => {
  try {
    logger.info("Clearing tables...");
    await db.delete(refreshtoken);
    await db.delete(users);
    await db.delete(roles);
    await db.delete(permissions);
    await db.delete(rolepermissions);
    await db.delete(userroles);
    await db.delete(ashStudent);
    await db.delete(ashOnlineRegistration);
    await db.delete(ashTermlyTracking);
    await db.delete(ashWeeklyAttendance);
    await db.delete(ashExit);
    await db.delete(ashProgramFeedback);
    await db.delete(volunteerRegistration);
    await db.delete(volunteerFeedback);
    await db.delete(tacotsRecommendation);
    await db.delete(tacotsOnboarding);
    await db.delete(tacotsTracking);
    await db.delete(tacotsExit);
    await db.delete(tacotsFeedback);
    await db.delete(outreachTracker);
    await db.delete(capacityBuildingEvaluation);
    await db.delete(projects);
    await db.delete(receipts);
    await db.delete(miscellaneous);
    await db.delete(blogs);
    await db.delete(notifications);
    await db.delete(donors);
    await db.delete(impactMetrics);
    logger.info("Tables cleared :)");
  } catch (error: any) {
    logger.error("Could not delete all tables", {
      message: error.message,
    });
  }
};

// INSTALL EXTENSIONS
const installExtensions = async () => {
  try {
    logger.info("Installing Extensions");
    await db.execute(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    logger.info("Extensions Installed :)");
  } catch (error: any) {
    logger.error("Could not install extensions", {
      message: error.message,
    });
  }
};

// there is no need for upserts however the code remains for reference purposes
// SEED ROLE, PERMISSIONS AND ROLEPERMISSIONS TABLE
const seedRolesAndPermissions = async () => {
  try {
    logger.info("Seeding roles table");
    // insert roles
    const newRoles = await db
      .insert(roles)
      .values([
        {
          id: sql`uuid_generate_v4()`,
          name: "volunteer",
          isDefault: true,
        },
        {
          id: sql`uuid_generate_v4()`,
          name: "admin",
        },
        {
          id: sql`uuid_generate_v4()`,
          name: "superadmin",
        },
      ])
      .onConflictDoUpdate({
        target: roles.name,
        set: {
          id: sql`excluded.id`,
          name: sql`excluded.name`,
          isDefault: sql`excluded.is_default`,
        },
      })
      .returning();
    logger.debug("new roles:", { roles: newRoles });

    logger.info("Seeding permissions table");
    // insert permissions
    const newPermissions = await db
      .insert(permissions)
      .values([
        {
          id: sql`uuid_generate_v4()`,
          name: "create",
        },
        {
          id: sql`uuid_generate_v4()`,
          name: "read",
        },
        {
          id: sql`uuid_generate_v4()`,
          name: "update",
        },
        {
          id: sql`uuid_generate_v4()`,
          name: "delete",
        },
      ])
      .onConflictDoUpdate({
        target: permissions.name,
        set: {
          id: sql`excluded.id`,
          name: sql`excluded.name`,
        },
      })
      .returning();
    logger.debug("new permissions:", { permissions: newPermissions });

    logger.info("Seeding rolepermissions table");
    // insert role permissions
    const newRolePermissions = await db
      .insert(rolepermissions)
      .values([
        { roleId: newRoles[2]!.id, permissionId: newPermissions[0]!.id }, // superad+create
        { roleId: newRoles[2]!.id, permissionId: newPermissions[1]!.id }, // superad+read
        { roleId: newRoles[2]!.id, permissionId: newPermissions[2]!.id }, // superad+update
        { roleId: newRoles[2]!.id, permissionId: newPermissions[3]!.id }, // superad+delete
        { roleId: newRoles[1]!.id, permissionId: newPermissions[0]!.id }, // admin+create
        { roleId: newRoles[1]!.id, permissionId: newPermissions[1]!.id }, // admin+read
        { roleId: newRoles[1]!.id, permissionId: newPermissions[2]!.id }, // admin+update
        { roleId: newRoles[0]!.id, permissionId: newPermissions[0]!.id }, // volunteer+create
        { roleId: newRoles[0]!.id, permissionId: newPermissions[1]!.id }, // volunteer+create
      ])
      .onConflictDoUpdate({
        target: [rolepermissions.roleId, rolepermissions.permissionId],
        set: {
          roleId: sql`excluded.role_id`,
          permissionId: sql`excluded.permission_id`,
        },
      })
      .returning();
    logger.debug("role permissions:", { rolepermissions: newRolePermissions });
  } catch (error: any) {
    logger.error(
      "could not seed one of the following tables: roles, permissions, role permissions",
      {
        message: error.message,
        error,
      },
    );
  }
};

// SEED USERS TABLE
const seedUsers = async () => {
  try {
    logger.info("seeding superadmin user");
    //
    const superadminUser = await db
      .insert(users)
      .values([
        {
          id: sql`uuid_generate_v4()`,
          name: "user3",
          email: "user3@gmail.com",
          password: await hashPassword("12345678"),
          department: "ASH",
        },
      ])
      .onConflictDoUpdate({
        target: users.email,
        set: {
          id: sql`excluded.id`,
          name: sql`excluded.name`,
          email: sql`excluded.email`,
          password: sql`excluded.password`,
          department: sql`excluded.department`,
        },
      })
      .returning();
    logger.debug("new user:", { users: superadminUser });

    const superadminRoleId = await db
      .select({
        id: roles.id,
      })
      .from(roles)
      .where(eq(roles.name, "superadmin"));
    logger.debug("superadmin role id?:", { superadminRoleId });

    const superadminUserRole = await db
      .insert(userroles)
      .values({
        userId: `${superadminUser[0]?.id}`,
        roleId: `${superadminRoleId[0]?.id}`,
      })
      .returning();
    logger.debug("new user role created:", { superadminUserRole });
    logger.info("seeded superadmin user");
  } catch (error: any) {
    logger.error("Error occured during user seeding", {
      message: error.message,
      error,
    });
  }
};

// SEED OTHER TABLES



// PHOTO COUNT
async function seedMiscellaneous() {
  try {
    await db.insert(miscellaneous).values({
      id: "74510b55-1342-47e8-b626-e85a6747f29e",
      numberOfPhotos: 266,
      numberOfPartners: 5,
    });

    logger.info(`Seeded miscellaneous`);
  } catch (error) {
    logger.error("could not seed miscellaneous table");
  }
}

// IMPACT DATA
async function seedImpactMetrics() {
  try {
    await db.insert(impactMetrics).values({});

    logger.info(`Seeded impact metrics table`);
  } catch (error) {
    logger.error("could not seed impact metrics table", { error });
  }
}

await clearTables();
await installExtensions();
await seedRolesAndPermissions();
await seedUsers();
// await seedAshStudent();
// await seedAshOnline();
// await seedAshTermlyTracking();
// await seedAshWeeklyAttendance();
// await seedAshExit();
// await seedAshProgramFeedback();
// await seedVolunteerRegistration();
// await seedVolunteerFeedback();
// await seedTacotsRecommendation();
// await seedTacotsOnboarding();
// await seedTacotsTracking();
// await seedTacotsExit();
// await seedTacotsFeedback();
// await seedOutreachTracker();
// await seedCapacityBuildingEvaluation();
// await seedProjects();
// await seedReceipts();
// await seedBlogs();
// await seedNotifications();
// await seedMiscellaneous();
// await seedDonors();
await seedImpactMetrics();
