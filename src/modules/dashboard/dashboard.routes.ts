//ROUTES
import express from "express";
import {
  getCardsController,
  getStudentPerformanceController,
  getEnrollmentController,
  getInstEffectivenessController,
  getNotificationsController,
  dismissNotificationController,
  getClientSideImpactNumbersController,
  updateClientSideImpactNumbersController,
} from "./dashboard.controller.js";
import {
  notificationIdSchema,
  notificationQuerySchema,
  impactMetricsSubmitSchema,
} from "./dashboard.schema.js";
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
router.get("/clientsidedata", getClientSideImpactNumbersController);
router.patch(
  "/clientsidedata",
  authenticate(),
  authorize("update"),
  validateRequest(impactMetricsSubmitSchema),
  updateClientSideImpactNumbersController,
);

export default router;
