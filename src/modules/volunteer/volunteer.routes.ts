//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  submitVolunteerRegistrationController,
  listVolunteersController,
  getVolunteerController,
  submitVolunteerFeedbackController,
  listVolunteerFeedbackController,
  getVolunteerFeedbackController,
} from "./volunteer.controller.js";
import {
  createVolunteerRegistrationSchema,
  volunteerRegistrationQuerySchema,
  volunteerRegistrationParamsSchema,
  createVolunteerFeedbackSchema,
  volunteerFeedbackParamsSchema,
  volunteerFeedbackQuerySchema,
} from "./volunteer.schema.js";
import { upload } from "../../configs/multer.config.js";

const router = express.Router();

// Submit volunteer registration
router.post(
  "/register",
  validateRequest(createVolunteerRegistrationSchema),
  submitVolunteerRegistrationController,
);

// List volunteers (default filter: status=pending)
router.get(
  "/",
  authenticate(),
  authorize("read"),
  validateRequest(volunteerRegistrationQuerySchema),
  listVolunteersController,
);

// Get Full volunteer detail
router.get(
  "/:id",
  authenticate(),
  authorize("read"),
  validateRequest(volunteerRegistrationParamsSchema),
  getVolunteerController,
);

// Submit volunteer feedback form
router.post(
  "/feedback",
  validateRequest(createVolunteerFeedbackSchema),
  submitVolunteerFeedbackController,
);

// List volunteer feedback submissions
router.get(
  "/all/feedback",
  authenticate(),
  authorize("read"),
  validateRequest(volunteerFeedbackQuerySchema),
  listVolunteerFeedbackController,
);

// Get single volunteer feedback submission
router.get(
  "/feedback/:id",
  authenticate(),
  authorize("read"),
  validateRequest(volunteerFeedbackParamsSchema),
  getVolunteerFeedbackController,
);
export default router;
