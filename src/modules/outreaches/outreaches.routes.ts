//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { upload } from "../../configs/multer.config.js";
import {
  createOutreachController,
  getOneOutreachController,
  listAllOutreachController,
  deleteOutreachController,
  exportOutreachTrackerController
} from "./outreaches.controller.js";
import {
  createOutreachTrackerSchema,
  outreachTrackerParamsSchema,
  outreachTrackerQuerySchema,
} from "./outreaches.schema.js";

const router = express.Router();
router.use(authenticate());

// Submit Cedar Outreach Tracker form
router.post(
  "/",
  authorize("create"),
  validateRequest(createOutreachTrackerSchema),
  createOutreachController,
);
// List outreach records (filterable by state, date)
router.get(
  "/",
  authorize("read"),
  validateRequest(outreachTrackerQuerySchema),
  listAllOutreachController,
);
// Get full outreach record detail
router.get(
  "/:id",
  authorize("read"),
  validateRequest(outreachTrackerParamsSchema),
  getOneOutreachController,
);
// Delete outreach record
router.delete(
  "/:id",
  authorize("delete"),
  validateRequest(outreachTrackerParamsSchema),
  deleteOutreachController,
);
// Download outreachTracker table
router.get("/download/outreachtracker", authenticate(), authorize("read"), exportOutreachTrackerController);

export default router;
