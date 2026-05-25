//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  createTacotsRecommendationSchema,
  createTacotsFeedbackSchema,
  tacotsRecommendationParamsSchema,
  tacotsRecommendationQuerySchema,
  tacotsFeedbackQuerySchema,
  tacotsFeedbackParamsSchema,
} from "./tacots.schema.js";
import {
  submitRecommendationController,
  listRecommendationsController,
  getRecommendationController,
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
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

export default router;
