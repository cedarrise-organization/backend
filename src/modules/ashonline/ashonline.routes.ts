//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { upload } from "../../configs/multer.config.js";
import { formUploadLimiter } from "../../middleware/rateLimiter.middleware.js";
import {
  createAshOnlineRegistrationSchema,
  ashOnlineRegistrationQuerySchema,
  ashOnlineRegistrationParamSchema,
  updateAshOnlineStatusSchema,
} from "./ashonline.schema.js";
import {
  submitRegistrationController,
  listRegistrationsController,
  getRegistrationController,
  updateAshOnlineStudentStatusController,
  deleteRegistrationController,
  exportAshOnlineStudentController,
} from "./ashonline.controller.js";

const router = express.Router();

// Submit An ASH-ONLINE Student Registration
router.post(
  "/registration",
  formUploadLimiter,
  upload.fields([
    { name: "currentCurriculum", maxCount: 1 },
    { name: "academicReport", maxCount: 1 },
  ]),
  validateRequest(createAshOnlineRegistrationSchema),
  submitRegistrationController,
);
// List all registrations (paginated, filterable)
router.get(
  "/registration",
  authenticate(),
  authorize("read"),
  validateRequest(ashOnlineRegistrationQuerySchema),
  listRegistrationsController,
);
// Get full ashOnlineStudent registration detail
router.get(
  "/registration/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashOnlineRegistrationParamSchema),
  getRegistrationController,
);
// Update ashOnlineStudent status (accepted/rejected/pending)
router.patch(
  "/registration/:id/status",
  authenticate(),
  authorize("update"),
  validateRequest(updateAshOnlineStatusSchema),
  updateAshOnlineStudentStatusController,
);
// Delete ashOnlineStudent registration record
router.delete(
  "/registration/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashOnlineRegistrationParamSchema),
  deleteRegistrationController,
);
// Download ashOnlineStudent table
router.get(
  "/download/ashonlinestudent",
  authenticate(),
  authorize("read"),
  exportAshOnlineStudentController,
);

export default router;
