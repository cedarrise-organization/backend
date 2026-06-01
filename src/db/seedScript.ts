import db from "./db.js";
import logger from "../configs/logger.config.js";
import { users, roles, permissions, rolepermissions, userroles } from "./models/auth.js";
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
} from "./models/admin.js";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "../utils/password.util.js";

// clear tables
const clearTables = async () => {
  try {
    await db.delete(users);
    await db.delete(roles);
    await db.delete(permissions);
    await db.delete(rolepermissions);
    await db.delete(userroles);
    await db.delete(ashStudent);
    await db.delete(ashExit);
    await db.delete(ashProgramFeedback);
    await db.delete(ashTermlyTracking);
    await db.delete(ashWeeklyAttendance);
    await db.delete(capacityBuildingEvaluation);
    await db.delete(tacotsExit);
    await db.delete(tacotsOnboarding);
    await db.delete(tacotsRecommendation);
    await db.delete(tacotsTracking);
    await db.delete(tacotsFeedback);
    await db.execute(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  } catch {
    console.log("Could not delete all tables");
  }
};

// there is no need for upserts
// however the code remains for reference purposes
const seedRoles = async () => {
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
  // logger.info("new roles:", { roles: newRoles });

  // insert roles
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
  // logger.info("new permissions:", { permissions: newPermissions });

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
  // logger.info("role permissions:", { rolepermissions: newRolePermissions });
};

const seedUsers = async () => {
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
  logger.info("new user:", { users: volunteerUser });

  const volunteerRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "volunteer"));
  // logger.info("volunterr role id?:", { volunteerRoleId });

  const volunteerUserRole = await db
    .insert(userroles)
    .values({
      userId: `${volunteerUser[0]?.id}`,
      roleId: `${volunteerRoleId[0]?.id}`,
    })
    .returning();
  // logger.info("new user role created:", { volunteerUserRole });
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
  logger.info("new user:", { user: adminUser });

  const adminRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "admin"));
  // logger.info("admin role id?:", { adminRoleId });

  const adminUserRole = await db
    .insert(userroles)
    .values({
      userId: `${adminUser[0]?.id}`,
      roleId: `${adminRoleId[0]?.id}`,
    })
    .returning();
  // logger.info("new user role created:", { adminUserRole });
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
  logger.info("new user:", { users: superadminUser });

  const superadminRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "superadmin"));
  // logger.info("superadmin role id?:", { superadminRoleId });

  const superadminUserRole = await db
    .insert(userroles)
    .values({
      userId: `${superadminUser[0]?.id}`,
      roleId: `${superadminRoleId[0]?.id}`,
    })
    .returning();
  // logger.info("new user role created:", { superadminUserRole });
};

console.log("Clearing tables...");
await clearTables();
console.log("Tables cleared");

console.log("Installing uuid-ossp");
await db.execute(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

console.log("running roles scripts...");
await seedRoles();

console.log("running user scripts...");
await seedUsers();
