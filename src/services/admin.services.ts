import db from "../db/db.js";
import { eq, sql } from "drizzle-orm";
import { appEvents } from "../lib/events.js";
import { ADMIN_EVENTS } from "../events/admin.events.js";
import { hashPassword } from "../utils/password.util.js";
import { roles, userroles, users } from "../db/models/auth.js";
import { conflictError } from "../lib/error.js";

export const getAllRoles = async () => {
  const appRoles = await db.select().from(roles);

  return {
    code: 200,
    message: "Cedarrise App roles found successfully",
    data: appRoles,
  };
};

export const getUserRoles = async (userId: string) => {
  const userRoles = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isDefault: roles.isDefault,
    })
    .from(userroles)
    .innerJoin(roles, eq(roles.id, userroles.roleId))
    .where(eq(userroles.userId, userId));

  return {
    code: 200,
    message: `Roles for user ${userId} found successfully`,
    data: userRoles,
  };
};

export const roleAction = async (userId: string, options: any) => {
  const { action, rolename } = options;

  if (action === "revoke") {
    const [role_] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, rolename));

    if (!role_) {
      throw new Error(`Role ${rolename} not found`);
    }

    await db
      .delete(userroles)
      .where(sql`${userroles.roleId} = ${role_.id} AND ${userroles.userId} = ${userId}`);

    appEvents.emit(ADMIN_EVENTS.REVOKE_ROLE, { role: rolename, userId });

    return {
      code: 200,
      message: `Role ${rolename} revoked successfully`,
    };
  }

  const [role_] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, rolename));

  if (!role_) {
    throw new Error(`Role ${rolename} not found`); //impossible sha
  }

  const newUserRole = await db
    .insert(userroles)
    .values({
      userId: userId,
      roleId: role_.id,
    })
    .returning();

  appEvents.emit(ADMIN_EVENTS.ASSIGN_ROLE, { role: rolename, userId });

  return {
    code: 200,
    message: `Role ${rolename} assigned successfully`,
    data: newUserRole,
  };
};

export const createUser = async (options: {
  name: string;
  email: string;
  password: string;
  department: string;
}) => {
  const { name, email, password, department } = options;

  const [ogUser] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (ogUser) {
    throw new conflictError("Email already exists");
  }

  const passwordHash = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      id: sql`uuid_generate_v4()`,
      name,
      email,
      password: passwordHash,
      department,
    })
    .returning();

  if (!newUser) {
    throw new Error("User could not be created");
  }

  appEvents.emit(ADMIN_EVENTS.CREATE_USER, { userId: newUser.id, name: newUser.name });

  const [role_] = await db.select({ id: roles.id }).from(roles).where(eq(roles.isDefault, true));

  if (!role_) {
    throw new Error(`Role not found`);
  }

  await db
    .insert(userroles)
    .values({
      userId: newUser.id,
      roleId: role_.id,
    })
    .returning();

  appEvents.emit(ADMIN_EVENTS.ASSIGN_ROLE, { role: "volunteer", user: newUser.id });

  return {
    code: 200,
    message: "User created successfully",
    data: newUser,
  };
};

export const listAllUsers = async () => {
  const allUsers = await db.select({ name: users.name, email: users.email }).from(users);

  return {
    code: 200,
    message: "All users found successfully",
    data: allUsers,
  };
};

export const deleteUser = async (userId: string) => {
  await db.delete(users).where(eq(users.id, userId));

  return {
    code: 200,
    message: "User deleted",
  };
};
