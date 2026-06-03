import * as p from "drizzle-orm/pg-core";
import { index, primaryKey, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"

// TIMESTAMPS
const timestamps = {
  updatedAt: p.timestamp("updated_at"),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  deletedAt: p.timestamp("deleted_at"),
};

// USERS
export const users = p.pgTable(
  "users",
  {
    id: p.uuid().primaryKey().default(sql`uuid_generate_v4()`).notNull(),
    name: p.text().notNull(),
    email: p.text().notNull().unique(),
    password: p.text().notNull(),
    department: p.text().notNull(),
    ...timestamps,
  },
  (table) => [index("user_name_idx").on(table.name)],
);

// REFRESHTOKEN
export const refreshtoken = p.pgTable("refreshtoken", {
  id: p.uuid().primaryKey().default(sql`uuid_generate_v4()`).notNull(),
  userId: p.uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  expiresAt: p.timestamp("expires_at").notNull(),
  token: p.text().notNull().unique(),
  ...timestamps,
});

// ROLES
export const roles = p.pgTable(
  "roles",
  {
    id: p.uuid().primaryKey().default(sql`uuid_generate_v4()`).notNull(),
    name: p.text().notNull().unique(), // volunteer, admin, superadmin
    description: p.text(),
    isDefault: p.boolean("is_default").default(false),
    ...timestamps,
  },
  (table) => [index("role_name_idx").on(table.name)],
);

// PERMISSIONS
export const permissions = p.pgTable(
  "permissions",
  {
    id: p.uuid().primaryKey().default(sql`uuid_generate_v4()`).notNull(),
    name: p.text().notNull().unique(), // create, read, update, delete
    description: p.text(),
    ...timestamps,
  },
  (table) => [index("permission_name_idx").on(table.name)],
);

// USERROLES
export const userroles = p.pgTable(
  "userroles",
  {
    userId: p
      .uuid("user_id")
      .references(() => users.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    roleId: p
      .uuid("role_id")
      .references(() => roles.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    description: p.text(),
    assignedAt: p.timestamp("assigned_at").defaultNow().notNull(),
    assignedBy: p.text("assigned_by"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

// ROLEPERMISSIONS
export const rolepermissions = p.pgTable(
  "rolepermissions",
  {
    roleId: p
      .uuid("role_id")
      .references(() => roles.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
    permissionId: p
      .uuid("permission_id")
      .references(() => permissions.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    unique().on(table.roleId, table.permissionId),
  ],
);
