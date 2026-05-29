//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  createTacotsRecommendationSchema,
  tacotsRecommendationQuerySchema,
  tacotsRecommendationParamsSchema,
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
  deleteRecommendationController,
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
  deleteFeedbackController,
  submitOnboardingController,
  listOnboardingController,
  getOnboardingController,
  deleteOnboardingController,
  submitTacotsTrackingController,
  listTacotsTrackingController,
  getTacotsTrackingController,
  deleteTacotsTrackingController,
  submitTacotsExitController,
  listTacotsExitController,
  getTacotsExitController,
  deleteTacotsExitController,
} from "./tacots.controller.js";

const router = express.Router();

// Submit TACOTS Recommendation Form
router.post(
  "/recommendation",
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
// Delete recommendation record
router.delete(
  "/recommendation/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(tacotsRecommendationParamsSchema),
  deleteRecommendationController,
);

// Submit ASH TACOTS Feedback
router.post("/feedback", validateRequest(createTacotsFeedbackSchema), submitFeedbackController);
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

// Create onboarding record post-shortlisting
router.post(
  "/onboarding",
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

// Submit TACOTS Student Tracking (midterm/end-of-term)
router.post(
  "/tracking",
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

// Submit TACOTS Exit/Completion Form
router.post(
  "/exit",
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

export default router;