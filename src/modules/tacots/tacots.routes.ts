//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createTacotsRecommendationSchema,
  createTacotsFeedbackSchema,
  tacotsRecommendationParamsSchema,
  tacotsRecommendationQuerySchema,
} from "./tacots.schema.js";
import {
  submitRecommendationController,
  listRecommendationsController,
  getRecommendationController,
  submitFeedbackController,
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

export default router;
