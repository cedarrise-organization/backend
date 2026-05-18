import express from "express";
import { donateSchema, verifySchema } from "./donate.schema.js";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { verifyPaystackHook } from "../../../middleware/verifyWebhook.middleware.js";
import {
  initializeController,
  verifyController,
  verifyViaCallbackController,
} from "./donate.controller.js";

const router = express.Router();

router.post("/", validateRequest(donateSchema), initializeController);
router.post("/webhook", verifyPaystackHook, verifyController);
router.get("/callback", validateRequest(verifySchema), verifyViaCallbackController);

export default router;
