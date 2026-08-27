//ROUTES
import express from "express";
import {
  getCardsController,
  getStudentPerformanceController,
  getEnrollmentController,
  getInstEffectivenessController,
  getNotificationsController,
  dismissNotificationController,
  getClientSideImpactNumbersController
} from "./dashboard.controller.js";
import { notificationIdSchema, notificationQuerySchema } from "./dashboard.schema.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

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
router.get(
  "/notifications",
  authenticate(),
  authorize("read"),
  validateRequest(notificationQuerySchema),
  getNotificationsController,
);
router.patch(
  "/notifications/:id",
  authenticate(),
  authorize("update"),
  validateRequest(notificationIdSchema),
  dismissNotificationController,
);
router.get(
  "/clientsidedata",
  getClientSideImpactNumbersController,
);

export default router;
