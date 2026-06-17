import db from "./db.js";
import fs from "node:fs/promises";
import logger from "../configs/logger.config.js";
import { users, roles, permissions, rolepermissions, userroles } from "./models/auth.js";
import { hashPassword } from "../utils/password.util.js";
import { eq, sql } from "drizzle-orm";
import {
  ashStudent,
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
import { projects } from "./models/dashboard.js";
import { refreshtoken } from "./models/auth.js";
import { receipts } from "./models/general.js";

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
    logger.info("seeding volunteer user");
    // insert new Users
    const volunteerUser = await db
      .insert(users)
      .values([
        {
          id: sql`uuid_generate_v4()`,
          name: "user1",
          email: "user1@gmail.com",
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
    logger.debug("new user:", { users: volunteerUser });

    const volunteerRoleId = await db
      .select({
        id: roles.id,
      })
      .from(roles)
      .where(eq(roles.name, "volunteer"));
    logger.debug("volunteer role id?:", { volunteerRoleId });

    const volunteerUserRole = await db
      .insert(userroles)
      .values({
        userId: `${volunteerUser[0]?.id}`,
        roleId: `${volunteerRoleId[0]?.id}`,
      })
      .returning();
    logger.debug("new user role created:", { volunteerUserRole });
    logger.info("seeded volunteer user");

    logger.info("seeding admin user");
    //
    const adminUser = await db
      .insert(users)
      .values([
        {
          id: sql`uuid_generate_v4()`,
          name: "user2",
          email: "user2@gmail.com",
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
    logger.debug("new user:", { user: adminUser });

    const adminRoleId = await db
      .select({
        id: roles.id,
      })
      .from(roles)
      .where(eq(roles.name, "admin"));
    logger.debug("admin role id?:", { adminRoleId });

    const adminUserRole = await db
      .insert(userroles)
      .values({
        userId: `${adminUser[0]?.id}`,
        roleId: `${adminRoleId[0]?.id}`,
      })
      .returning();
    logger.debug("new user role created:", { adminUserRole });
    logger.info("seeded admin user");

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

// ASH
async function seedAshStudent() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/ash_student.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(ashStudent).values(rows);

    logger.info(`Inserted ${rows.length} rows into ashstudent`);
  } catch (error) {
    logger.error("Could not seed ashstudent tables", { error });
  }
}
async function seedAshTermlyTracking() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_termly_tracking.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(ashTermlyTracking).values(rows);

    logger.info(`Inserted ${rows.length} rows into ashTermlyTracking`);
  } catch (error) {
    logger.error("could not seed ashtermlytracking table", { error });
  }
}
async function seedAshWeeklyAttendance() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_weekly_attendance.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          sessionDate: new Date(row.sessionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashWeeklyAttendance).values(rows);

    logger.info(`Inserted ${rows.length} rows into ashWeeklyAttendance`);
  } catch (error) {
    logger.error("could not seed ashWeeklyAttendance table", { error });
  }
}
async function seedAshExit() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/ash_exit.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          exitDate: new Date(row.exitDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashExit).values(rows);

    logger.info(`Inserted ${rows.length} rows into ashExit`);
  } catch (error) {
    logger.error("could not seed ashExit table", { error });
  }
}
async function seedAshProgramFeedback() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/ash_program_feedback.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(ashProgramFeedback).values(rows);

    logger.info(`Inserted ${rows.length} rows into ashProgramFeedback`);
  } catch (error) {
    logger.error("could not seed ashProgramFeedback table", { error });
  }
}

// VOLUNTEER
async function seedVolunteerRegistration() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/volunteer_registration.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          dob: new Date(row.dob),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(volunteerRegistration).values(rows);

    logger.info(`Inserted ${rows.length} rows into volunteerRegistration`);
  } catch (error) {
    logger.error("could not seed volunteerRegistration table", { error });
  }
}
async function seedVolunteerFeedback() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/volunteer_feedback.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          submissionDate: new Date(row.submissionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(volunteerFeedback).values(rows);

    logger.info(`Inserted ${rows.length} rows into volunteerFeedback`);
  } catch (error) {
    logger.error("could not seed volunteerFeedback table", { error });
  }
}

// TACOTS
async function seedTacotsRecommendation() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/tacots_recommendation.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          dob: new Date(row.dob),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(tacotsRecommendation).values(rows);

    logger.info(`Inserted ${rows.length} rows into tacotsRecommendation`);
  } catch (error) {
    logger.error("could not seed tacotsRecommendation table", { error });
  }
}
async function seedTacotsOnboarding() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/tacots_onboarding.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          onboardingDate: new Date(row.onboardingDate),
          termResumptionDate: new Date(row.termResumptionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(tacotsOnboarding).values(rows);

    logger.info(`Inserted ${rows.length} rows into tacotsOnboarding`);
  } catch (error) {
    logger.error("could not seed tacotsOnboarding table", { error });
  }
}
async function seedTacotsTracking() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/tacots_tracking.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          submissionDate: new Date(row.submissionDate),
          mentorshipSessionDate: new Date(row.mentorshipSessionDate),
          serviceDate: new Date(row.serviceDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(tacotsTracking).values(rows);

    logger.info(`Inserted ${rows.length} rows into tacotsTracking`);
  } catch (error) {
    logger.error("could not seed tacotsTracking table", { error });
  }
}
async function seedTacotsExit() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/tacots_exit.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          submissionDate: new Date(row.submissionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(tacotsExit).values(rows);

    logger.info(`Inserted ${rows.length} rows into tacotsExit`);
  } catch (error) {
    logger.error("could not seed tacotsExit table", { error });
  }
}
async function seedTacotsFeedback() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/tacots_feedback.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(tacotsFeedback).values(rows);

    logger.info(`Inserted ${rows.length} rows into tacotsFeedback`);
  } catch (error) {
    logger.error("could not seed tacotsFeedback table", { error });
  }
}

// OUTREACH
async function seedOutreachTracker() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/outreach_tracker.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          outreachStartDate: new Date(row.outreachStartDate),
          outreachEndDate: new Date(row.outreachEndDate),
          submissionDate: new Date(row.submissionDate),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(outreachTracker).values(rows);

    logger.info(`Inserted ${rows.length} rows into outreachTracker`);
  } catch (error) {
    logger.error("could not seed outreachTracker table", { error });
  }
}

// CAPACITY
async function seedCapacityBuildingEvaluation() {
  try {
    const file = await fs.readFile(
      `${process.cwd()}/src/db/seeddata/capacity_building_evaluation.jsonl`,
      "utf-8",
    );

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const row = JSON.parse(line);

        return {
          ...row,
          programDate: new Date(row.programDate),
          dateSubmitted: new Date(row.dateSubmitted),
          createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
        };
      });

    await db.insert(capacityBuildingEvaluation).values(rows);

    logger.info(`Inserted ${rows.length} rows into capacityBuildingEvaluation`);
  } catch (error) {
    logger.error("could not seed capacityBuildingEvaluation table", { error });
  }
}

// PROJECTS
async function seedProjects() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/projects.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(projects).values(rows);

    logger.info(`Inserted ${rows.length} rows into projects`);
  } catch (error) {
    logger.error("could not seed projects table", { error });
  }
}

// RECEIPTS
async function seedReceipts() {
  try {
    const file = await fs.readFile(`${process.cwd()}/src/db/seeddata/receipts.jsonl`, "utf-8");

    const rows = file
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));

    await db.insert(receipts).values(rows);

    logger.info(`Inserted ${rows.length} rows into receipts`);
  } catch (error) {
    logger.error("could not seed receipts table", { error });
  }
}

await clearTables();
await installExtensions();
await seedRolesAndPermissions();
await seedUsers();
await seedAshStudent();
await seedAshTermlyTracking();
await seedAshWeeklyAttendance();
await seedAshExit();
await seedAshProgramFeedback();
await seedVolunteerRegistration();
await seedVolunteerFeedback();
await seedTacotsRecommendation();
await seedTacotsOnboarding();
await seedTacotsTracking();
await seedTacotsExit();
await seedTacotsFeedback();
await seedOutreachTracker();
await seedCapacityBuildingEvaluation();
await seedProjects();
await seedReceipts();
