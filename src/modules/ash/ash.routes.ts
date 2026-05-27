//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  createAshStudentSchema,
  ashStudentQuerySchema,
  ashStudentParamsSchema,
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
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
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

// Submit ASH Termly Tracking record
router.post(
  "/tracking",
  upload.single("file"),
  authorize("create"),
  validateRequest(createAshTermlyTrackingSchema),
  submitTrackingController,
);

// List termly tracking records (paginated)
router.get(
  "/tracking",
  authorize("read"),
  validateRequest(ashTermlyTrackingQuerySchema),
  listTrackingController,
);

// Get full tracking record detail
router.get(
  "/tracking/:id",
  authorize("read"),
  validateRequest(ashTermlyTrackingParamsSchema),
  getTrackController,
);

// Delete tracking record
router.delete(
  "/tracking/:id",
  authorize("delete"),
  validateRequest(ashTermlyTrackingParamsSchema),
  deleteTrackController,
);

// Submit ASH Weekly Attendance
router.post(
  "/attendance",
  authorize("create"),
  validateRequest(createAshWeeklyAttendanceSchema),
  submitAttendanceController,
);

// List weekly attendance records
router.get(
  "/attendance",
  authorize("read"),
  validateRequest(ashWeeklyAttendanceQuerySchema),
  listAttendanceController,
);

// Get full attendance record detail
router.get(
  "/attendance/:id",
  authorize("read"),
  validateRequest(ashWeeklyAttendanceParamsSchema),
  getAttendanceController,
);

// Delete attendance record
router.delete(
  "/attendance/:id",
  authorize("delete"),
  validateRequest(ashWeeklyAttendanceParamsSchema),
  deleteAttendanceController,
);

// Submit ASH Exit Form
router.post(
  "/exit",
  authorize("create"),
  validateRequest(createAshExitSchema),
  submitExitController,
);

// List exit records
router.get("/exit", authorize("read"), validateRequest(ashExitQuerySchema), listExitController);

// Get full exit record detail
router.get("/exit/:id", authorize("read"), validateRequest(ashExitParamsSchema), getExitController);

// Delete exit record
router.delete(
  "/exit/:id",
  authorize("delete"),
  validateRequest(ashExitParamsSchema),
  deleteExitController,
);

export default router;
