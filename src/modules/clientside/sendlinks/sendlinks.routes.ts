//ROUTES
import express from "express";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { sendLinkEmailSchema, sendPWSEmailSchema } from "./sendlinks.schema.js";
import { sendLinksLimiter } from "../../../middleware/rateLimiter.middleware.js";
import {
  sendLinkEmailController,
  sendPartnerWithUsEmailController,
} from "./sendlinks.controller.js";
const router = express.Router();

router.post(
  "/initiatives",
  sendLinksLimiter,
  validateRequest(sendLinkEmailSchema),
  sendLinkEmailController,
);
router.post(
  "/partners",
  sendLinksLimiter,
  validateRequest(sendPWSEmailSchema),
  sendPartnerWithUsEmailController,
);

export default router;
