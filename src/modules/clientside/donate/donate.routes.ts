import express from "express";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { donationLimiter } from "../../../middleware/rateLimiter.middleware.js";
import { verifyPaystackHook } from "../../../middleware/verifyWebhook.middleware.js";
import { authenticate, authorize } from "../../../middleware/auth.middleware.js";
import {
  initializeController,
  verifyViaWebhookController,
  verifyViaCallbackController,
  getDonationRecordsController,
  downloadDonationRecordsController,
  deleteDonationRecordController,
} from "./donate.controller.js";
import {
  donateSchema,
  verifySchema,
  donateParamsSchema,
  donateQuerySchema,
} from "./donate.schema.js";

const router = express.Router();

router.get("/", (req, res) => {
  const message = req.query.message;
  const error = req.query.error;

  if (error) {
    return res.status(500).json({
      error,
    });
  }

  return res.status(200).json({
    message,
  });
});
// START DONATION REQUEST TO PAYSTACK SERVER
router.post("/", donationLimiter, validateRequest(donateSchema), initializeController);
// VERIFY DONATION VIA WEBHOOK
router.post("/webhook", verifyPaystackHook, verifyViaWebhookController);
// VERIFY DONATION VIA CALLBACK
router.get("/callback", validateRequest(verifySchema), verifyViaCallbackController);
// GET ALL DONATION RECORDS - update permissions so only admins+ can see
router.get(
  "/records",
  authenticate(),
  authorize("update"),
  validateRequest(donateQuerySchema),
  getDonationRecordsController,
);
// DOWNLOAD DONATION RECORDS AS CSV - update permissions so only admins+ can see
router.get("/download", authenticate(), authorize("update"), downloadDonationRecordsController);
// DELETE A DONATION RECORD
router.delete(
  "/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(donateParamsSchema),
  deleteDonationRecordController,
);

export default router;
