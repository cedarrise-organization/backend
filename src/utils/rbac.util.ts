import db from "../configs/db.config.js";
import logger from "../configs/logger.config.js";
import { eq, inArray } from "drizzle-orm";
import { permissions, rolepermissions, userroles } from "../db/schema.js";
import { cacheGetOrSet } from "../lib/cache.js";
import { CACHE_TTL } from "../lib/cache.js";

// return all permissions of a user
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const key = `cedarrise:permissions:${userId}`

  const userPermissions = await cacheGetOrSet(key, CACHE_TTL.PERMISSIONS, async () => {
    // Get the user's role ids
    const role_ids_array: string[] = [];
    const role_ids = await db
      .select({ roleId: userroles.roleId })
      .from(userroles)
      .where(eq(userroles.userId, userId));
    for (const role_id of role_ids) {
      role_ids_array.push(role_id.roleId);
    }
    logger.debug("role ids", { role_ids });

    // get permission ids associated with the user
    const permission_ids_array: string[] = [];
    const permission_ids = await db
      .select({ permissionId: rolepermissions.permissionId })
      .from(rolepermissions)
      .where(inArray(rolepermissions.roleId, role_ids_array));
    for (const permission_id of permission_ids) {
      permission_ids_array.push(permission_id.permissionId);
    }
    logger.debug("permission ids:", { permission_ids });

    // find the permission names
    const userPermissions = new Set<string>();
    const permissionNames = await db
      .select({ name: permissions.name })
      .from(permissions)
      .where(inArray(permissions.id, permission_ids_array));
    for (const permissionName of permissionNames) {
      userPermissions.add(permissionName.name);
    }

    // logger.debug("user permissions:", { user_permissions: [...userPermissions] });
    return [...userPermissions];
  });
      logger.debug("user permissions:", { user_permissions: [...userPermissions] });
  return userPermissions
};
