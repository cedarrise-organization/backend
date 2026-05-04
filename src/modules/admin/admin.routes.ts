//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authorize } from "../../middleware/auth.middleware.js";
import { userIdSchema, roleActionSchema } from "./admin.schema.js";
import {
  getUserRolesController,
  getAllRolesController,
  roleActionController,
} from "./admin.controller.js";
const router = express.Router();

// List all roles and their permissions
router.get("/roles", authorize("read"), getAllRolesController);

// List a user's roles
router.get(
  "/users/:userId/roles",
  authorize("read"),
  validateRequest(userIdSchema),
  getUserRolesController,
);

// Assign/Revoke a user's role
router.post(
  "/users/:userId/roles/action",
  authorize("update"),
  validateRequest(roleActionSchema),
  roleActionController,
);

export default router;
