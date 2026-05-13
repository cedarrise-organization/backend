//ROUTES
import express from "express";
import { homeFeedbackSchema } from "./feedback.schema.js";
import { sendFeedbackMailController } from "./feedback.controller.js";
import { validateRequest } from "../../middleware/validate.middleware.js";

const router = express.Router();

router.post("/home", validateRequest(homeFeedbackSchema), sendFeedbackMailController);

export default router;
