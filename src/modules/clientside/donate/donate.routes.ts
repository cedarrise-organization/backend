import express from "express";
import { donateSchema, verifySchema } from "./donate.schema.js";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { verifyPaystackHook } from "../../../middleware/verifyWebhook.middleware.js";
import {
  initializeController,
  verifyViaWebhookController,
  verifyViaCallbackController,
} from "./donate.controller.js";

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
router.post("/", validateRequest(donateSchema), initializeController);
router.post("/webhook", verifyPaystackHook, verifyViaWebhookController);
router.get("/callback", validateRequest(verifySchema), verifyViaCallbackController);

export default router;
