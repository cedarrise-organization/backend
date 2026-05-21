//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  submitRegistrationController,
  listVolunteersController,
  getVolunteerController,
  submitVolunteerFeedbackController,
} from "./volunteer.controller.js";
import {
  createVolunteerRegistrationSchema,
  volunteerRegistrationQuerySchema,
  volunteerRegistrationParamsSchema,
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

// List volunteers (default filter: status=pending)
router.get("/", validateRequest(volunteerRegistrationQuerySchema), listVolunteersController);

// Get Full volunteer detail
router.get("/:id", validateRequest(volunteerRegistrationParamsSchema), getVolunteerController);

// Submit volunteer feedback form
router.post(
  "/feedback",
  validateRequest(createVolunteerFeedbackSchema),
  submitVolunteerFeedbackController,
);

export default router;
