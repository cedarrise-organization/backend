//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { formUploadLimiter, generalLimiter } from "../../middleware/rateLimiter.middleware.js";
import {
  createTacotsRecommendationSchema,
  tacotsRecommendationQuerySchema,
  tacotsRecommendationParamsSchema,
  updateTacotsRecommendationStatusSchema,
  createTacotsFeedbackSchema,
  tacotsFeedbackQuerySchema,
  tacotsFeedbackParamsSchema,
  createTacotsOnboardingSchema,
  tacotsOnboardingQuerySchema,
  tacotsOnboardingParamsSchema,
  createTacotsTrackingSchema,
  tacotsTrackingQuerySchema,
  tacotsTrackingParamsSchema,
  createTacotsExitSchema,
  tacotsExitQuerySchema,
  tacotsExitParamsSchema,
} from "./tacots.schema.js";
import {
  submitRecommendationController,
  listRecommendationsController,
  getRecommendationController,
  updateRecommendedStudentStatusController,
  deleteRecommendationController,
  exportTacotsRecommendationController,
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
  deleteFeedbackController,
  exportTacotsFeedbackController,
  submitOnboardingController,
  listOnboardingController,
  getOnboardingController,
  deleteOnboardingController,
  exportTacotsOnboardingController,
  submitTacotsTrackingController,
  listTacotsTrackingController,
  getTacotsTrackingController,
  deleteTacotsTrackingController,
  exportTacotsTrackingController,
  submitTacotsExitController,
  listTacotsExitController,
  getTacotsExitController,
  deleteTacotsExitController,
  exportTacotsExitController,
} from "./tacots.controller.js";

const router = express.Router();

// Submit TACOTS Recommendation Form
router.post(
  "/recommendation",
  /*formUploadLimiter,*/
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "lastResult", maxCount: 1 },
  ]),
  validateRequest(createTacotsRecommendationSchema),
  submitRecommendationController,
);
// List recommendations (filterable by admin_status)
router.get(
  "/recommendation",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsRecommendationQuerySchema),
  listRecommendationsController,
);
// Get full recommendation detail
router.get(
  "/recommendation/:id",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsRecommendationParamsSchema),
  getRecommendationController,
);
// Update status (KEEP IN VIEW/SELECTED/NOT SELECTED)
router.patch(
  "/recommendation/:id/status",
  authenticate(),
  authorize("update"),
  validateRequest(updateTacotsRecommendationStatusSchema),
  updateRecommendedStudentStatusController,
);
// Delete recommendation record
router.delete(
  "/recommendation/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsRecommendationParamsSchema),
  deleteRecommendationController,
);
// Download tacotsRecommendation table
router.get(
  "/download/tacotsrecommendation",
  authenticate(),
  authorize("read"),
  exportTacotsRecommendationController,
);

// Submit ASH TACOTS Feedback
router.post(
  "/feedback",
  /*formUploadLimiter,*/
  validateRequest(createTacotsFeedbackSchema),
  submitFeedbackController,
);
// List TACOTS feedback submissions
router.get(
  "/feedback",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsFeedbackQuerySchema),
  listFeedbackController,
);
// Get full TACOTS feedback submission
router.get(
  "/feedback/:id",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsFeedbackParamsSchema),
  getFeedbackController,
);
// Delete TACOTS feedback record
router.delete(
  "/feedback/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsFeedbackParamsSchema),
  deleteFeedbackController,
);
// Download tacotsFeedback table
router.get(
  "/download/tacotsfeedback",
  authenticate(),
  authorize("read"),
  exportTacotsFeedbackController,
);

// Create onboarding record post-shortlisting
router.post(
  "/onboarding",
  generalLimiter,
  upload.fields([
    { name: "parentSignature", maxCount: 1 },
    { name: "admissionLetter", maxCount: 1 },
  ]),
  authenticate(),
  authorize("create"),
  validateRequest(createTacotsOnboardingSchema),
  submitOnboardingController,
);
// List onboarding records
router.get(
  "/onboarding",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsOnboardingQuerySchema),
  listOnboardingController,
);
// Full onboarding detail
router.get(
  "/onboarding/:id",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsOnboardingParamsSchema),
  getOnboardingController,
);
// Delete onboarding record
router.delete(
  "/onboarding/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsOnboardingParamsSchema),
  deleteOnboardingController,
);
// Download tacotsOnboarding table
router.get(
  "/download/tacotsonboarding",
  authenticate(),
  authorize("read"),
  exportTacotsOnboardingController,
);

// Submit TACOTS Student Tracking (midterm/end-of-term)
router.post(
  "/tracking",
  generalLimiter,
  upload.fields([
    { name: "termResult", maxCount: 1 },
    { name: "paymentEvidence", maxCount: 1 },
  ]),
  authenticate(),
  authorize("create"),
  validateRequest(createTacotsTrackingSchema),
  submitTacotsTrackingController,
);
// List tracking records
router.get(
  "/tracking",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsTrackingQuerySchema),
  listTacotsTrackingController,
);
// Full tracking record detail
router.get(
  "/tracking/:id",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsTrackingParamsSchema),
  getTacotsTrackingController,
);
// Delete tracking record
router.delete(
  "/tracking/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsTrackingParamsSchema),
  deleteTacotsTrackingController,
);
// Download tacotsTracking table
router.get(
  "/download/tacotstracking",
  authenticate(),
  authorize("read"),
  exportTacotsTrackingController,
);

// Submit TACOTS Exit/Completion Form
router.post(
  "/exit",
  generalLimiter,
  authenticate(),
  authorize("create"),
  validateRequest(createTacotsExitSchema),
  submitTacotsExitController,
);
// List exit records
router.get(
  "/exit",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsExitQuerySchema),
  listTacotsExitController,
);
// Full exit record detail
router.get(
  "/exit/:id",
  authenticate(),
  authorize("read"),
  validateRequest(tacotsExitParamsSchema),
  getTacotsExitController,
);
// Delete exit record
router.delete(
  "/exit/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsExitParamsSchema),
  deleteTacotsExitController,
);
// Download TacotsExit table
router.get("/download/tacotsexit", authenticate(), authorize("read"), exportTacotsExitController);

export default router;
