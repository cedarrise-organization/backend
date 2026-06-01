//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  createAshStudentSchema,
  ashStudentQuerySchema,
  ashStudentParamsSchema,
  updateAshStudentStatusSchema,
  createAshProgramFeedbackSchema,
  ashProgramFeedbackQuerySchema,
  ashProgramFeedbackParamsSchema,
  createAshTermlyTrackingSchema,
  ashTermlyTrackingParamsSchema,
  ashTermlyTrackingQuerySchema,
  createAshWeeklyAttendanceSchema,
  ashWeeklyAttendanceParamsSchema,
  ashWeeklyAttendanceQuerySchema,
  createAshExitSchema,
  ashExitParamsSchema,
  ashExitQuerySchema,
} from "./ash.schema.js";
import {
  submitRegistrationController,
  listRegistrationsController,
  getRegistrationController,
  updateAshStudentStatusController,
  assignAshMentorController,
  deleteRegistrationController,
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
  deleteFeedbackController,
  submitTrackingController,
  listTrackingController,
  getTrackController,
  deleteTrackController,
  submitAttendanceController,
  listAttendanceController,
  getAttendanceController,
  deleteAttendanceController,
  submitExitController,
  listExitController,
  getExitController,
  deleteExitController,
} from "./ash.controller.js";

const router = express.Router();

// Submit ASH Student Registration
router.post(
  "/registration",
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "lastResult", maxCount: 1 },
    { name: "parentSignature", maxCount: 1 },
  ]),
  validateRequest(createAshStudentSchema),
  submitRegistrationController,
);
// List all registrations (paginated, filterable)
router.get(
  "/registration",
  authenticate(),
  authorize("read"),
  validateRequest(ashStudentQuerySchema),
  listRegistrationsController,
);
// Get full registration detail
router.get(
  "/registration/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashStudentParamsSchema),
  getRegistrationController,
);
// Update status (accepted/rejected/pending)
router.patch(
  "/registration/:id/status",
  authenticate(),
  authorize("update"),
  validateRequest(updateAshStudentStatusSchema),
  updateAshStudentStatusController,
);
// Assign mentor to student (admin-only)
router.patch(
  "/registration/:id/assign-mentor",
  authenticate(),
  authorize("update"),
  assignAshMentorController,
);
// Delete registration record
router.delete(
  "/registration/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashStudentParamsSchema),
  deleteRegistrationController,
);

// Submit ASH Program Feedback
router.post("/feedback", validateRequest(createAshProgramFeedbackSchema), submitFeedbackController);
// List ASH feedback submissions
router.get(
  "/feedback",
  authenticate(),
  authorize("read"),
  validateRequest(ashProgramFeedbackQuerySchema),
  listFeedbackController,
);
// Get full ASH feedback submission detail
router.get(
  "/feedback/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashProgramFeedbackParamsSchema),
  getFeedbackController,
);
// Delete feedback record
router.delete(
  "/registration/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashProgramFeedbackParamsSchema),
  deleteFeedbackController,
);

// Submit ASH Termly Tracking record
router.post(
  "/tracking",
  upload.single("file"),
  authenticate(),
  authorize("create"),
  validateRequest(createAshTermlyTrackingSchema),
  submitTrackingController,
);
// List termly tracking records (paginated)
router.get(
  "/tracking",
  authenticate(),
  authorize("read"),
  validateRequest(ashTermlyTrackingQuerySchema),
  listTrackingController,
);
// Get full tracking record detail
router.get(
  "/tracking/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashTermlyTrackingParamsSchema),
  getTrackController,
);
// Delete tracking record
router.delete(
  "/tracking/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashTermlyTrackingParamsSchema),
  deleteTrackController,
);

// Submit ASH Weekly Attendance
router.post(
  "/attendance",
  authenticate(),
  authorize("create"),
  validateRequest(createAshWeeklyAttendanceSchema),
  submitAttendanceController,
);
// List weekly attendance records
router.get(
  "/attendance",
  authenticate(),
  authorize("read"),
  validateRequest(ashWeeklyAttendanceQuerySchema),
  listAttendanceController,
);
// Get full attendance record detail
router.get(
  "/attendance/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashWeeklyAttendanceParamsSchema),
  getAttendanceController,
);
// Delete attendance record
router.delete(
  "/attendance/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashWeeklyAttendanceParamsSchema),
  deleteAttendanceController,
);

// Submit ASH Exit Form
router.post(
  "/exit",
  authenticate(),
  authorize("create"),
  validateRequest(createAshExitSchema),
  submitExitController,
);
// List exit records
router.get(
  "/exit",
  authenticate(),
  authorize("read"),
  validateRequest(ashExitQuerySchema),
  listExitController,
);
// Get full exit record detail
router.get(
  "/exit/:id",
  authenticate(),
  authorize("read"),
  validateRequest(ashExitParamsSchema),
  getExitController,
);
// Delete exit record
router.delete(
  "/exit/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(ashExitParamsSchema),
  deleteExitController,
);

export default router;
