//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { submitRegistrationController, submitFeedbackController } from "./ash.controller.js";
import { upload } from "../../configs/multer.config.js";
import { createAshStudentSchema, createAshProgramFeedbackSchema } from "./ash.schema.js";

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

// Submit ASH Program Feedback
router.post("/feedback", validateRequest(createAshProgramFeedbackSchema), submitFeedbackController);

export default router;
