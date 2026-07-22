import db from "../db/db.js";
import { eq, sql, asc, count } from "drizzle-orm";
import { appEvents } from "../lib/events.js";
import { ADMIN_EVENTS } from "../events/admin.events.js";
import { hashPassword } from "../utils/password.util.js";
import { roles, userroles, users } from "../db/models/auth.js";
import { cacheGet, cacheSet, CACHE_TTL } from "../lib/cache.js";
import { conflictError } from "../lib/error.js";

export const listAllRoles = async () => {
  const appRoles = await db.select().from(roles);

  return {
    code: 200,
    message: "Cedarrise App roles found successfully",
    data: appRoles,
  };
};

export const listUserRoles = async (userId: string) => {
  /// cache
  const key = `cedarrise:lookup:userroles:${userId}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) { 
    return {
      code: 200,
      message: `Roles for user ${userId} found successfully`,
      data: cacheRes,
    };
  }
  ///

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

  /// cache set
  await cacheSet(key, userRoles, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: `Roles for user ${userId} found successfully`,
    data: userRoles,
  };
};

export const roleAction = async (userId: string, options: any, correlationId: string) => {
  const { action, rolename } = options;

  if (action === "revoke") {
    const [role_] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, rolename));

    if (!role_) {
      throw new Error(`Role ${rolename} not found`);
    }

    await db
      .delete(userroles)
      .where(sql`${userroles.roleId} = ${role_.id} AND ${userroles.userId} = ${userId}`);

    appEvents.emit(ADMIN_EVENTS.REVOKE_ROLE, { role: rolename, userId, correlationId });

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
    .returning()
    .onConflictDoNothing();

  appEvents.emit(ADMIN_EVENTS.ASSIGN_ROLE, { role: rolename, userId, correlationId });

  return {
    code: 200,
    message: `Role ${rolename} assigned successfully`,
    data: newUserRole,
  };
};

export const createUser = async (
  options: {
    name: string;
    email: string;
    password: string;
    department: string;
  },
  correlationId: string,
) => {
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
      name,
      email,
      password: passwordHash,
      department,
    })
    .returning();

  if (!newUser) {
    throw new Error("User could not be created");
  }

  appEvents.emit(ADMIN_EVENTS.DELETE_CACHE, {
    singleKey: undefined,
    patternKey: `cedarrise:lookup:users:*`,
    event: "USER CREATED",
    correlationId,
  });

  appEvents.emit(ADMIN_EVENTS.CREATE_USER, {
    userId: newUser.id,
    name: newUser.name,
    role: "volunteer",
    department,
    email: newUser.email,
    password,
    correlationId,
  });

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

  appEvents.emit(ADMIN_EVENTS.ASSIGN_ROLE, {
    role: "volunteer",
    userId: newUser.id,
    name,
    email,
    correlationId,
  });

  return {
    code: 200,
    message: "User created successfully",
    data: newUser,
  };
};

export const listAllUsers = async () => {
  /// cache
  const key = `cedarrise:lookup:users`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "All users  found successfully",
      data: cacheRes,
    };
  }
  ///

  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, department: users.department })
    .from(users);

  /// cache set
  await cacheSet(key, allUsers, CACHE_TTL.LISTS);
  ///

  return {
    code: 200,
    message: "All users found successfully",
    data: allUsers,
  };
};

export const listUsersForUserPage = async (
  page: number,
  limit: number,
  search: string,
  correlationId: string,
) => {
  // search
  if (search) {
    const searchVector = sql`
      setweight(to_tsvector('english', ${users.name}), 'A') ||
      setweight(to_tsvector('english', ${users.email}), 'A') ||
      setweight(to_tsvector('english', ${users.department}), 'A')
    `;
    const searchQuery = sql`plainto_tsquery('english', ${search})`;

    const [allUsers, [totalDocuments]] = await Promise.all([
      db
        .select()
        .from(users)
        .where(sql`${searchVector} @@ ${searchQuery}`)
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ value: count(users.id) })
        .from(users)
        .where(sql`${searchVector} @@ ${searchQuery}`),
    ]);
    const totalPages = Math.ceil(totalDocuments!.value / limit);

    return {
      code: 200,
      message: "All users found successfully",
      data: allUsers,
      meta: {
        pagination: {
          page,
          limit,
          totalPages,
        },
        correlationId,
      },
    };
  }

  /// cache
  const key = `cedarrise:lookup:users:${page}:${limit}`;
  const cacheRes = await cacheGet<any>(key);
  if (cacheRes) {
    return {
      code: 200,
      message: "All users  found successfully",
      data: cacheRes.data,
      meta: {
        pagination: {
          page,
          limit,
          totalPages: cacheRes.totalPages,
        },
        correlationId,
      },
    };
  }
  ///

  const [allUsers, [totalDocuments]] = await Promise.all([
    db
      .select()
      .from(users)
      .orderBy(asc(users.name))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ value: count(users.id) }).from(users),
  ]);
  const totalPages = Math.ceil(totalDocuments!.value / limit);

  /// cache set
  await cacheSet(key, { data: allUsers, totalPages }, CACHE_TTL.USERS);
  ///

  return {
    code: 200,
    message: "All users found successfully",
    data: allUsers,
    meta: {
      pagination: {
        page,
        limit,
        totalPages,
      },
      correlationId,
    },
  };
};

export const deleteUser = async (userId: string, correlationId: string) => {
  const [oldUser] = await db.delete(users).where(eq(users.id, userId)).returning();

  if (!oldUser) {
    throw new Error("Could not delete user");
  }

  appEvents.emit(ADMIN_EVENTS.DELETE_USER, {
    deletedUser: oldUser.id,
    correlationId,
  });

  return {
    code: 200,
    message: "User deleted",
  };
};
