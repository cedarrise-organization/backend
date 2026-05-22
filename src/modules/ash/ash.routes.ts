//ROUTES
import express from "express";
import { upload } from "../../configs/multer.config.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createAshStudentSchema,
  ashStudentQuerySchema,
  ashStudentParamsSchema,
  createAshProgramFeedbackSchema,
  ashProgramFeedbackQuerySchema,
  ashProgramFeedbackParamsSchema,
} from "./ash.schema.js";
import {
  submitRegistrationController,
  listRegistrationsController,
  getRegistrationController,
  submitFeedbackController,
  listFeedbackController,
  getFeedbackController,
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
router.get("/registration", validateRequest(ashStudentQuerySchema), listRegistrationsController);

// Get full registration detail
router.get("/registration/:id", validateRequest(ashStudentParamsSchema), getRegistrationController);

// Submit ASH Program Feedback
router.post("/feedback", validateRequest(createAshProgramFeedbackSchema), submitFeedbackController);

// List ASH feedback submissions
router.get("/feedback", validateRequest(ashProgramFeedbackQuerySchema), listFeedbackController);

// Get full ASH feedback submission detail
router.get("/feedback/:id", validateRequest(ashProgramFeedbackParamsSchema), getFeedbackController);

export default router;
