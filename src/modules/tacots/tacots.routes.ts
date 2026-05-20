//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { createTacotsRecommendationSchema, createTacotsFeedbackSchema } from "./tacots.schema.js";
import { submitRecommendationController, submitFeedbackController } from "./tacots.controller.js";

const router = express.Router();

// Submit TACOTS Recommendation Form
router.post(
  "/reccomendation",
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "lastResult", maxCount: 1 },
  ]),
  validateRequest(createTacotsRecommendationSchema),
  submitRecommendationController,
);

// Submit ASH TACOTS Feedback
router.post("/feedback", validateRequest(createTacotsFeedbackSchema), submitFeedbackController);

export default router;
