import db from "../configs/db.config.js";
import { eq, sql } from "drizzle-orm";
import { roles, userroles } from "../db/schema.js";
import { NotFoundError } from "../lib/error.js";

// write event emmitters for this
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
    const role_ = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, rolename));

    if (!role_[0]) {
      throw new NotFoundError(`Role ${rolename} not found`); //impossible sha
    }

    await db
      .delete(userroles)
      .where(sql`${userroles.roleId} = ${role_[0].id} AND ${userroles.userId} = ${userId}`);

    return { 
      code: 200,
      message: `Role ${rolename} revoked successfully`,
    };
  }

  const role_ = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, rolename));

  if (!role_[0]) {
    throw new NotFoundError(`Role ${rolename} not found`); //impossible sha
  }

  const newUserRole = await db
    .insert(userroles)
    .values({
      userId: userId,
      roleId: role_[0].id,
    })
    .returning();

  return {
    code: 200,
    message: `Role ${rolename} assigned successfully`,
    data: newUserRole,
  };
};
