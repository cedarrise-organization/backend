//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  submitRegistrationController,
  submitVolunteerFeedbackController,
} from "./volunteer.controller.js";
import {
  createVolunteerRegistrationSchema,
  createVolunteerFeedbackSchema,
} from "./volunteer.schema.js";
import { upload } from "../../configs/multer.config.js";

const router = express.Router();

// Submit volunteer registration
router.post(
  "/register",
  validateRequest(createVolunteerRegistrationSchema),
  submitRegistrationController,
);

// Submit volunteer feedback form
router.post(
  "/feedback",
  validateRequest(createVolunteerFeedbackSchema),
  submitVolunteerFeedbackController,
);

export default router;
