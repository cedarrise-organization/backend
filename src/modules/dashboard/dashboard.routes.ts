//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
// import { } from "./dashboard.schema.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  getCardsController,
  getStudentPerformanceController,
  getEnrollmentController,
  getInstEffectivenessController,
} from "./dashboard.controller.js";
const router = express.Router();

router.get("/cards", authenticate(), authorize("read"), getCardsController);
router.get(
  "/student-performance",
  authenticate(),
  authorize("read"),
  getStudentPerformanceController,
);
router.get("/enrollment", authenticate(), authorize("read"), getEnrollmentController);
router.get(
  "/institutional-effectiveness",
  authenticate(),
  authorize("read"),
  getInstEffectivenessController,
);
// router.get("/");

export default router;
