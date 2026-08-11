//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { studentProfileParam } from "./studentprofile.schema.js";
import { getAshData, getTacotsData } from "./studentprofile.controller.js";
const router = express.Router();

// Get Ash Student Profile Data
router.get(
  "/ash/:id",
  authenticate(),
  authorize("read"),
  validateRequest(studentProfileParam),
  getAshData,
);
// Get Tacots Student Profile Data
router.get(
  "/tacots/:id",
  authenticate(),
  authorize("read"),
  validateRequest(studentProfileParam),
  getTacotsData,
);

export default router;
