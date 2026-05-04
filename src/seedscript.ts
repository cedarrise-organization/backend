import db from "./configs/db.config.js";
import logger from "./configs/logger.config.js";
import { users, roles, permissions, rolepermissions, userroles } from "./db/schema.js";
import { eq, sql } from "drizzle-orm";

// reconfigure upserts
export const seedRoles = async () => {
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
    .onConflictDoNothing()
    .returning();
  logger.info("new roles:", { roles: newRoles });

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
    .onConflictDoNothing()
    .returning();
  logger.info("new permissions:", { permissions: newPermissions });

  const newRolePermissions = await db.insert(rolepermissions).values([
    { roleId: newRoles[2]!.id, permissionId: newPermissions[0]!.id }, // superad+create
    { roleId: newRoles[2]!.id, permissionId: newPermissions[1]!.id }, // superad+read
    { roleId: newRoles[2]!.id, permissionId: newPermissions[2]!.id }, // superad+update
    { roleId: newRoles[2]!.id, permissionId: newPermissions[3]!.id }, // superad+delete
    { roleId: newRoles[1]!.id, permissionId: newPermissions[0]!.id }, // admin+create
    { roleId: newRoles[1]!.id, permissionId: newPermissions[1]!.id }, // admin+read
    { roleId: newRoles[1]!.id, permissionId: newPermissions[2]!.id }, // admin+update
    { roleId: newRoles[0]!.id, permissionId: newPermissions[0]!.id }, // volunteer+create
    { roleId: newRoles[0]!.id, permissionId: newPermissions[1]!.id }, // volunteer+create
  ]);
  logger.info("role permissions:", { rolepermissions: newRolePermissions });
};

export const seedUsers = async () => {
  // insert new Users
  const volunteerUser = await db
    .insert(users)
    .values([
      {
        id: sql`uuid_generate_v4()`,
        name: "user1",
        email: "user1@gmail.com",
        password: "user1",
        department: "ASH",
      },
    ])
    .onConflictDoNothing()
    .returning();
  logger.info("new users:", { users: volunteerUser });

  const volunteerRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "volunteer"));
  logger.info("volunterr role id?:", { volunteerRoleId });

  const volunteerUserRole = await db
    .insert(userroles)
    .values({
      userId: `${volunteerUser[0]?.id}`,
      roleId: `${volunteerRoleId[0]?.id}`,
    })
    .returning();
  logger.info("new user role created:", { volunteerUserRole });
  //
  const adminUser = await db
    .insert(users)
    .values([
      {
        id: sql`uuid_generate_v4()`,
        name: "user2",
        email: "user2@gmail.com",
        password: "user2",
        department: "ASH",
      },
    ])
    .onConflictDoNothing()
    .returning();
  logger.info("new users:", { users: adminUser });

  const adminRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "admin"));
  logger.info("volunterr role id?:", { adminRoleId });

  const adminUserRole = await db
    .insert(userroles)
    .values({
      userId: `${adminUser[0]?.id}`,
      roleId: `${adminRoleId[0]?.id}`,
    })
    .returning();
  logger.info("new user role created:", { adminUserRole });
  //
  const superadminUser = await db
    .insert(users)
    .values([
      {
        id: sql`uuid_generate_v4()`,
        name: "user3",
        email: "user3@gmail.com",
        password: "user3",
        department: "ASH",
      },
    ])
    .onConflictDoNothing()
    .returning();
  logger.info("new users:", { users: superadminUser });

  const superadminRoleId = await db
    .select({
      id: roles.id,
    })
    .from(roles)
    .where(eq(roles.name, "superadmin"));
  logger.info("volunterr role id?:", { superadminRoleId });

  const superadminUserRole = await db
    .insert(userroles)
    .values({
      userId: `${superadminUser[0]?.id}`,
      roleId: `${superadminRoleId[0]?.id}`,
    })
    .returning();
  logger.info("new user role created:", { superadminUserRole });
};

await seedRoles();
console.log("running roles scripts");
await seedUsers();
console.log("running user scripts");
