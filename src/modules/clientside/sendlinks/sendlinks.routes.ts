//ROUTES
import express from "express";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import {
  sendLinkEmailSchema,
  sendPWSEmailSchema,
  sendAshOnlineLinkEmailSchema,
} from "./sendlinks.schema.js";
import { sendLinksLimiter } from "../../../middleware/rateLimiter.middleware.js";
import {
  sendLinkEmailController,
  sendPartnerWithUsEmailController,
  sendAshOnlineEmailController,
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
router.post(
  "/ashonline",
  sendLinksLimiter,
  validateRequest(sendAshOnlineLinkEmailSchema),
  sendAshOnlineEmailController,
);

export default router;
