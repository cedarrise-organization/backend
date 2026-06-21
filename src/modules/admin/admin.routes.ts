//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { userIdSchema, roleActionSchema, newUserSchema, userQuerySchema } from "./admin.schema.js";
import {
  listUserRolesController,
  listAllRolesController,
  roleActionController,
  listAllUsersController,
  createUserController,
  deleteUserController,
} from "./admin.controller.js";

const router = express.Router();
router.use(authenticate());

// List all roles and their permissions
router.get("/roles", authorize("read"), listAllRolesController);

// List a user's roles
router.get(
  "/roles/:userId",
  authorize("read"),
  validateRequest(userIdSchema),
  listUserRolesController,
);

// Assign/Revoke a user's role
router.patch(
  "/roles/:userId/action",
  authorize("update"),
  validateRequest(roleActionSchema),
  roleActionController,
);

// Create a new user
router.post("/users", authorize("create"), validateRequest(newUserSchema), createUserController);

// List all users
router.get("/users", authorize("read"), listAllUsersController);

// Delete a user
router.delete(
  "/users/:userId",
  authorize("delete"),
  validateRequest(userIdSchema),
  deleteUserController,
);

// List all users for user page
router.get("/listusers", authorize("read"), validateRequest(userQuerySchema), listAllUsersController);
export default router;
