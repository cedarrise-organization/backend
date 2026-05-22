//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
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
  validateRequest(tacotsRecommendationQuerySchema),
  listRecommendationsController,
);

// Get full recommendation detail
router.get(
  "/recommendation/:id",
  validateRequest(tacotsRecommendationParamsSchema),
  getRecommendationController,
);

// Submit ASH TACOTS Feedback
router.post("/feedback", validateRequest(createTacotsFeedbackSchema), submitFeedbackController);

// List TACOTS feedback submissions
router.get("/feedback", validateRequest(tacotsFeedbackQuerySchema), listFeedbackController);

// Get full TACOTS feedback submission
router.get("/feedback/:id", validateRequest(tacotsFeedbackParamsSchema), getFeedbackController);

export default router;
